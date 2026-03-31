import "server-only";

import { NextRequest } from "next/server";

import type { AdminRole } from "@/lib/admin/constants";
import { getAdminUserFromRequest, type AdminUser } from "@/lib/admin/session";
import { isRoleAtLeast } from "@/lib/admin/rbac";

export class AdminAuthError extends Error {
  status: number;
  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

export async function requireAdmin(req: NextRequest, role: AdminRole = "viewer"): Promise<AdminUser> {
  const user = await getAdminUserFromRequest(req);
  if (!user) throw new AdminAuthError("Unauthorized", 401);
  if (!isRoleAtLeast(user.role, role)) throw new AdminAuthError("Forbidden", 403);
  return user;
}

