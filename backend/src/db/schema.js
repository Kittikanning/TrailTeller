import { pgTable, serial, text, timestamp, integer, varchar, numeric } from "drizzle-orm/pg-core";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 150 }).unique().notNull(),
  preferences: text("preferences"), // เช่น เก็บเป็น JSON หรือ string
  budget: numeric("budget", { precision: 10, scale: 2 }), // งบประมาณรวม
});

// Destination Table
export const destinations = pgTable("destinations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  location: varchar("location", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }), // เช่น beach, mountain, city
  avg_cost: numeric("avg_cost", { precision: 10, scale: 2 }),
});

// Trip Table
export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
  destination_id: integer("destination_id")
    .references(() => destinations.id)
    .notNull(),
  dates: varchar("dates", { length: 50 }), // หรือใช้ date range ได้ถ้าระบบรองรับ
  budget: numeric("budget", { precision: 10, scale: 2 }),
});

// Booking Table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  trip_id: integer("trip_id")
    .references(() => trips.id)
    .notNull(),
  service_type: varchar("service_type", { length: 50 }).notNull(), // เช่น hotel, flight, car
  status: varchar("status", { length: 50 }).default("pending"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});

// Recommendation Table
export const recommendations = pgTable("recommendations", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .references(() => users.id)
    .notNull(),
  trip_id: integer("trip_id")
    .references(() => trips.id),
  score: numeric("score", { precision: 4, scale: 2 }), // เช่น 0.00 - 10.00
});