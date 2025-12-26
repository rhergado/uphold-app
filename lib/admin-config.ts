/**
 * Admin Configuration
 *
 * Super Admin: robert.her.delgado@gmail.com (always has admin access)
 * Additional Admins: Can be added/removed through the admin settings page
 */

// Super admin email - always has full admin access
export const SUPER_ADMIN_EMAIL = "robert.her.delgado@gmail.com";

// Additional admin emails - can be modified through settings
// For MVP, stored in code. For production, store in database or environment variable.
export const ADDITIONAL_ADMIN_EMAILS: string[] = [
  // Add additional admin emails here
  // Example: "another.admin@example.com"
];

/**
 * Check if a user email has admin access
 */
export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;

  // Check if super admin
  if (email === SUPER_ADMIN_EMAIL) return true;

  // Check if in additional admins list
  return ADDITIONAL_ADMIN_EMAILS.includes(email);
}

/**
 * Check if a user is the super admin
 */
export function isSuperAdmin(email: string | undefined): boolean {
  return email === SUPER_ADMIN_EMAIL;
}

/**
 * Add an admin email to the list
 */
export function addAdminEmail(email: string): boolean {
  if (!email || !email.includes("@")) return false;
  if (isAdminEmail(email)) return false; // Already admin

  ADDITIONAL_ADMIN_EMAILS.push(email);
  return true;
}

/**
 * Remove an admin email from the list
 */
export function removeAdminEmail(email: string): boolean {
  if (email === SUPER_ADMIN_EMAIL) return false; // Can't remove super admin

  const index = ADDITIONAL_ADMIN_EMAILS.indexOf(email);
  if (index === -1) return false;

  ADDITIONAL_ADMIN_EMAILS.splice(index, 1);
  return true;
}

/**
 * Get all admin emails (super admin + additional admins)
 */
export function getAllAdminEmails(): string[] {
  return [SUPER_ADMIN_EMAIL, ...ADDITIONAL_ADMIN_EMAILS];
}
