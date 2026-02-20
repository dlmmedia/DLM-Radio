import {
  pgTable,
  text,
  timestamp,
  integer,
  boolean,
  primaryKey,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  newsletterOptIn: boolean("newsletter_opt_in").default(true).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ── User feature tables ──────────────────────────────────────────────

export const favorites = pgTable(
  "favorites",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stationUuid: text("station_uuid").notNull(),
    stationData: jsonb("station_data").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("favorites_user_station_idx").on(t.userId, t.stationUuid)]
);

export const listeningHistory = pgTable(
  "listening_history",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    stationUuid: text("station_uuid").notNull(),
    stationData: jsonb("station_data").notNull(),
    listenedAt: timestamp("listened_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [index("history_user_listened_idx").on(t.userId, t.listenedAt)]
);

export const playlists = pgTable("playlists", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const playlistStations = pgTable(
  "playlist_stations",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    playlistId: text("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    stationUuid: text("station_uuid").notNull(),
    stationData: jsonb("station_data").notNull(),
    position: integer("position").notNull(),
    addedAt: timestamp("added_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    index("playlist_stations_playlist_idx").on(t.playlistId, t.position),
  ]
);

export const userPreferences = pgTable("user_preferences", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  autoVisualizer: boolean("auto_visualizer").default(true).notNull(),
  idleTimeout: integer("idle_timeout").default(120).notNull(),
  defaultScene: text("default_scene").default("auto").notNull(),
  visualMood: text("visual_mood"),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
