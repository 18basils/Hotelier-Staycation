import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../hotel_system.db');

export const db = new DatabaseSync(DB_PATH);

// Enable foreign keys and WAL mode
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      role TEXT DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      state TEXT,
      image_url TEXT,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL DEFAULT 9.9885,
      longitude REAL DEFAULT 76.2657,
      star_rating INTEGER NOT NULL CHECK (star_rating BETWEEN 1 AND 5),
      contact_no TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      images TEXT,
      featured BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      ac TEXT NOT NULL CHECK (ac IN ('ac', 'nonac')),
      beds INTEGER NOT NULL CHECK (beds >= 1),
      capacity INTEGER NOT NULL DEFAULT 2,
      description TEXT,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      room_number TEXT NOT NULL,
      price_per_night REAL NOT NULL,
      status TEXT DEFAULT 'available',
      UNIQUE(hotel_id, room_number)
    );

    CREATE TABLE IF NOT EXISTS reservations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      booking_code TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
      check_in DATE NOT NULL,
      check_out DATE NOT NULL,
      total_nights INTEGER NOT NULL,
      total_price REAL NOT NULL,
      status TEXT DEFAULT 'CONFIRMED',
      guest_name TEXT,
      guest_contact TEXT,
      special_requests TEXT,
      base_fare REAL,
      tax_amount REAL,
      service_fee REAL,
      discount_amount REAL DEFAULT 0,
      coupon_code TEXT,
      payment_status TEXT DEFAULT 'PAID',
      payment_method TEXT DEFAULT 'UPI / Card',
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hotel_id INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
      reservation_id INTEGER,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      username TEXT,
      user_full_name TEXT,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT NOT NULL,
      verified BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS coupons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      discount_type TEXT NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FLAT')),
      discount_value REAL NOT NULL,
      max_discount REAL,
      min_booking_value REAL,
      active BOOLEAN DEFAULT 1,
      description TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_hotels_place ON hotels(place_id);
    CREATE INDEX IF NOT EXISTS idx_rooms_hotel ON rooms(hotel_id);
    CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_room ON reservations(room_id);
    CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(room_id, check_in, check_out);
  `);
}

export default db;
