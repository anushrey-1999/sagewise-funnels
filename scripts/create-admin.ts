import { z } from "zod";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";

const envSchema = z.object({
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12),
  ADMIN_ROLE: z
    .enum(["viewer", "client_editor", "internal_admin", "superadmin"])
    .optional()
    .default("superadmin"),
});

async function main() {
  const env = envSchema.parse(process.env);
  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 12);

  const [user] = await db
    .insert(adminUsers)
    .values({
      email: env.ADMIN_EMAIL.toLowerCase(),
      passwordHash,
      role: env.ADMIN_ROLE,
    })
    .onConflictDoNothing()
    .returning({ id: adminUsers.id, email: adminUsers.email, role: adminUsers.role });

  if (!user) {
    console.log("Admin already exists (email conflict).");
    return;
  }

  console.log("Created admin:", user);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

