import { pgTable, serial, text, timestamp, integer, varchar, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(), // เพิ่ม password
  preferences: text("preferences"), // JSON string
  budget: numeric("budget", { precision: 10, scale: 2 }),
  created_at: timestamp("created_at").defaultNow(),
});

// Destinations Table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }), // beach, mountain, city
  avg_cost: numeric("avg_cost", { precision: 10, scale: 2 }),
  description: text("description"),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow(),
});

// Trips Table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  destination_id: integer("destination_id")
    .references(() => destinations.id, { onDelete: "set null" }),
  dates: varchar("dates", { length: 50 }), // e.g., "2025-01-01 to 2025-01-07"
  budget: numeric("budget", { precision: 10, scale: 2 }),
  status: varchar("status", { length: 50 }).default("planning"), // planning, confirmed, completed
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Bookings Table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  service_type: varchar("service_type", { length: 50 }).notNull(), // hotel, flight, car
  service_name: varchar("service_name", { length: 255 }),
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, cancelled
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  booking_date: timestamp("booking_date"),
  created_at: timestamp("created_at").defaultNow(),
});

// Recommendations Table
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  trip_id: integer("trip_id")
    .references(() => trips.id, { onDelete: "set null" }),
  destination_id: integer("destination_id")
    .references(() => destinations.id, { onDelete: "set null" }),
  score: numeric("score", { precision: 4, scale: 2 }), // 0.00 - 10.00
  reason: text("reason"),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  recommendations: many(recommendations),
}));

export const destinationsRelations = relations(destinations, ({ many }) => ({
  trips: many(trips),
  recommendations: many(recommendations),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.user_id],
    references: [users.id],
  }),
  destination: one(destinations, {
    fields: [trips.destination_id],
    references: [destinations.id],
  }),
  bookings: many(bookings),
  recommendations: many(recommendations),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  trip: one(trips, {
    fields: [bookings.trip_id],
    references: [trips.id],
  }),
}));

export const recommendationsRelations = relations(recommendations, ({ one }) => ({
  user: one(users, {
    fields: [recommendations.user_id],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [recommendations.trip_id],
    references: [trips.id],
  }),
  destination: one(destinations, {
    fields: [recommendations.destination_id],
    references: [destinations.id],
  }),
}));