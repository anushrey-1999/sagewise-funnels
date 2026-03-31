import "server-only";

import type { AdminRole } from "@/lib/admin/constants";

const ROLE_ORDER: AdminRole[] = [
  "viewer",
  "client_editor",
  "internal_admin",
  "superadmin",
];

export function isRoleAtLeast(role: AdminRole, required: AdminRole): boolean {
  return ROLE_ORDER.indexOf(role) >= ROLE_ORDER.indexOf(required);
}

export function canEditScripts(role: AdminRole): boolean {
  return role === "internal_admin" || role === "superadmin";
}

