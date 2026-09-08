// Run with: npm run seed-admin
// Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from your env file and
// creates (or updates) the one admin account. Safe to re-run — it just
// resets the password if the account already exists.
//
// Loads .env.local first (same file `npm run dev` uses), then falls back
// to .env — so whichever one you've actually been editing works.

import { config } from "dotenv";
config({ path: ".env.local" });
config();

import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { AdminUser } from "../src/models/AdminUser";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const uri = process.env.MONGODB_URI;

  if (!email || !password) {
    throw new Error("Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env.local file first.");
  }
  if (!uri) {
    throw new Error("Set MONGODB_URI in your .env.local file first.");
  }
  if (password.length < 8) {
    throw new Error("Pick a password that's at least 8 characters.");
  }

  console.log(`Connecting to MongoDB...`);
  await mongoose.connect(uri);
  console.log(`Connected. Creating/updating admin account for ${email}...`);

  const passwordHash = await bcrypt.hash(password, 10);
  await AdminUser.findOneAndUpdate(
    { email },
    { email, passwordHash },
    { upsert: true, new: true }
  );

  console.log(`Admin account ready for ${email}. You can now log in at /admin/login.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});