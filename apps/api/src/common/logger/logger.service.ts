import { Injectable, LoggerService, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Structured JSON logger following ENGINEERING_RULES.md.
 *
 * Every log entry includes: module, severity, timestamp.
 * Sensitive data must NEVER be passed to this logger.
 *
 * Respects LOG_LEVEL env var to filter output.
 * Levels (ascending): verbose < debug < info < warn < error
 */
@Injectable()
export class AppLoggerService implements LoggerService {
  private readonly levelPriority: Record<string, number> = {
    verbose: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  private configuredLevel: string;

  constructor(private readonly config: ConfigService) {
    this.configuredLevel = this.config.get<string>('logging.level', 'info');
  }

  log(message: string, context?: string): void {
    this.writeLog('info', message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.writeLog('error', message, context, { trace });
  }

  warn(message: string, context?: string): void {
    this.writeLog('warn', message, context);
  }

  debug(message: string, context?: string): void {
    this.writeLog('debug', message, context);
  }

  verbose(message: string, context?: string): void {
    this.writeLog('verbose', message, context);
  }

  setLogLevels(levels: LogLevel[]): void {
    // When NestJS sets log levels, use the lowest priority level from the array
    if (levels.length > 0) {
      const lowestLevel = levels.reduce((lowest, level) => {
        const priority = this.levelPriority[level] ?? 2;
        const lowestPriority = this.levelPriority[lowest] ?? 2;
        return priority < lowestPriority ? level : lowest;
      });
      this.configuredLevel = lowestLevel;
    }
  }

  private shouldLog(severity: string): boolean {
    const messagePriority = this.levelPriority[severity] ?? 2;
    const configuredPriority = this.levelPriority[this.configuredLevel] ?? 2;
    return messagePriority >= configuredPriority;
  }

  private writeLog(
    severity: string,
    message: string,
    module?: string,
    extra?: Record<string, unknown>,
  ): void {
    if (!this.shouldLog(severity)) {
      return;
    }

    const entry = {
      timestamp: new Date().toISOString(),
      severity,
      module: module || 'Application',
      message,
      ...extra,
    };

    const output = JSON.stringify(entry);

    switch (severity) {
      case 'error':
        process.stderr.write(output + '\n');
        break;
      default:
        process.stdout.write(output + '\n');
        break;
    }
  }
}
