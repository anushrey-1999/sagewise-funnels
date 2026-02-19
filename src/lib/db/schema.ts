import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';


export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  firstName: varchar('first_name', { length: 255 }),
  lastName: varchar('last_name', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const adminUsers = pgTable(
  'admin_users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 320 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull(), // superadmin | internal_admin | client_editor | viewer
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (t) => ({
    emailUnique: uniqueIndex('admin_users_email_unique').on(t.email),
  })
);

export const adminSessions = pgTable(
  'admin_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => adminUsers.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({
    tokenHashUnique: uniqueIndex('admin_sessions_token_hash_unique').on(t.tokenHash),
  })
);

export const adminLoginAttempts = pgTable('admin_login_attempts', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 320 }),
  ip: varchar('ip', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const configs = pgTable(
  'configs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    kind: text('kind').notNull(), // funnel | adwall
    /**
     * For kind=funnel: key is funnelId (e.g. "mortgage")
     * For kind=adwall: key is "routePrefix/type" (e.g. "mortgage/one", "cc/finbuzz")
     */
    key: text('key').notNull(),
    draft: jsonb('draft').notNull(),
    published: jsonb('published'),
    version: integer('version').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    publishedAt: timestamp('published_at'),
    updatedBy: uuid('updated_by').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
  },
  (t) => ({
    kindKeyUnique: uniqueIndex('configs_kind_key_unique').on(t.kind, t.key),
  })
);

export const configVersions = pgTable(
  'config_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    configId: uuid('config_id')
      .notNull()
      .references(() => configs.id, { onDelete: 'cascade' }),
    kind: text('kind').notNull(),
    key: text('key').notNull(),
    version: integer('version').notNull(),
    action: text('action').notNull(), // publish | rollback
    data: jsonb('data').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    createdBy: uuid('created_by').references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
  },
  (t) => ({
    configVersionUnique: uniqueIndex('config_versions_config_id_version_unique').on(
      t.configId,
      t.version
    ),
  })
);