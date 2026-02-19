import "server-only";

import { redirect } from "next/navigation";

import type { AdminRole } from "@/lib/admin/constants";
import { getAdminUserFromCookies } from "@/lib/admin/session";
import { isRoleAtLeast } from "@/lib/admin/rbac";

export async function requireAdminPage(role: AdminRole = "viewer") {
  const user = await getAdminUserFromCookies();
  if (!user) redirect("/admin/login");
  if (!isRoleAtLeast(user.role, role)) redirect("/admin/login");
  return user;
}

