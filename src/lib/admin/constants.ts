export const ADMIN_SESSION_COOKIE = "sw_admin_session";

export const ADMIN_SESSION_DAYS = 14;

export const ADMIN_ROLES = [
  "viewer",
  "client_editor",
  "internal_admin",
  "superadmin",
] as const;

export type AdminRole = (typeof ADMIN_ROLES)[number];

