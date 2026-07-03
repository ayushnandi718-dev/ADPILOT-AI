// Run: npm run create-admin
// Reads ADMIN_EMAIL and ADMIN_PASSWORD from .env
// Only works if no admin user exists yet (safe to re-run)

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  process.exit(1);
}

const db = new Database(path.join(__dirname, "..", "dev.db"));
const hash = bcrypt.hashSync(password, 10);

const existing = db.prepare("SELECT id, role FROM User WHERE email = ?").get(email);

if (existing) {
  db.prepare("UPDATE User SET passwordHash = ?, role = ?, name = ?, plan = ?, emailVerified = ? WHERE email = ?")
    .run(hash, "admin", "Admin", "enterprise", 1, email);
  console.log("Admin user updated:", email);
} else {
  const id = "admin_" + Date.now();
  db.prepare("INSERT INTO User (id, clerkId, email, passwordHash, role, name, plan, emailVerified, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))")
    .run(id, id, email, hash, "admin", "Admin", "enterprise", 1);
  console.log("Admin user created:", email);
}

db.close();
console.log("Done. Sign in with your admin credentials.");
