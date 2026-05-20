/**
 * Generates a URL-safe slug from a display name.
 * Shared utility extracted from BoardsService and WorkspacesService
 * to follow DRY principle per ENGINEERING_RULES.md.
 *
 * Rules:
 * - Lowercase
 * - Replace non-alphanumeric characters with hyphens
 * - Remove leading/trailing hyphens
 * - Truncate to 50 characters
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}
