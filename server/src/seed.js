import bcrypt from 'bcryptjs';
import { db, initDatabase } from './db.js';

export function seedDatabase() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already contains data, skipping seed.');
    return;
  }

  console.log('Seeding database with initial data...');

  // 1. Create Default Users
  const adminHash = bcrypt.hashSync('admin123', 10);
  const userHash = bcrypt.hashSync('user123', 10);

  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  const adminId = insertUser.run('admin', 'admin@hotelier.com', adminHash, 'System Administrator', 'ADMIN').lastInsertRowid;
  const userId = insertUser.run('user', 'user@example.com', userHash, 'Guest', 'USER').lastInsertRowid;

  // 2. Insert Places
  const insertPlace = db.prepare(`
    INSERT INTO places (name, state, image_url, description)
    VALUES (?, ?, ?, ?)
  `);

  const kochiId = insertPlace.run(
    'Kochi',
    'Kerala',
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    'The Queen of the Arabian Sea, famous for colonial architecture, Chinese fishing nets, and backwaters.'
  ).lastInsertRowid;

  const munnarId = insertPlace.run(
    'Munnar',
    'Kerala',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
    'Idyllic rolling green tea gardens, misty hills, cool mountain breeze, and serene waterfalls.'
  ).lastInsertRowid;

  const wayanadId = insertPlace.run(
    'Wayanad',
    'Kerala',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    'Lush rainforests, ancient caves, coffee plantations, and wildlife sanctuaries.'
  ).lastInsertRowid;

  const kovalamId = insertPlace.run(
    'Kovalam',
    'Kerala',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'World-renowned coastal beach paradise with iconic striped lighthouses and golden shores.'
  ).lastInsertRowid;

  // 3. Insert Room Categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (name, ac, beds, capacity, description, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const catDeluxeAc = insertCategory.run(
    'Deluxe AC Room',
    'ac',
    2,
    2,
    'Comfortable climate-controlled room with king bed, balcony view, and modern amenities.',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
  ).lastInsertRowid;

  const catExecSuite = insertCategory.run(
    'Executive Suite AC',
    'ac',
    2,
    4,
    'Spacious suite featuring separate living area, panoramic views, and luxury bathroom.',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
  ).lastInsertRowid;

  const catStdNonAc = insertCategory.run(
    'Standard Single Non-AC',
    'nonac',
    1,
    1,
    'Budget-friendly cozy single room with natural mountain air circulation and study desk.',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
  ).lastInsertRowid;

  const catFamilyAc = insertCategory.run(
    'Family Suite AC',
    'ac',
    3,
    5,
    'Ideal for families with children, offering 3 comfortable beds, dining space, and smart TV.',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
  ).lastInsertRowid;

  const catStdDoubleNonAc = insertCategory.run(
    'Standard Double Non-AC',
    'nonac',
    2,
    2,
    'Economy double room featuring natural ventilation, twin beds, and en-suite shower.',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
  ).lastInsertRowid;

  // 4. Insert Hotels
  const insertHotel = db.prepare(`
    INSERT INTO hotels (place_id, name, address, star_rating, contact_no, description, image_url, featured)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const h1 = insertHotel.run(
    kochiId,
    'Grand Hyatt Kochi Bolgatty',
    'Mulavukad, Bolgatty Island, Kochi, Kerala 682504',
    5,
    '+91 484 266 1234',
    'A waterfront luxury urban resort perched on Bolgatty Island with spectacular backwater views and signature dining.',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    1
  ).lastInsertRowid;

  const h2 = insertHotel.run(
    kochiId,
    'Old Harbour Hotel Fort Kochi',
    '1/328 Tower Road, Fort Kochi, Kochi 682001',
    4,
    '+91 484 221 8002',
    'A 300-year-old heritage boutique hotel with Portuguese architecture, lush courtyard, and open-air swimming pool.',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    0
  ).lastInsertRowid;

  const h3 = insertHotel.run(
    munnarId,
    'Fragrant Nature Munnar',
    'Pothamedu, Munnar, Kerala 685612',
    5,
    '+91 486 523 0001',
    'Luxury hill resort nestled in the heart of tea plantations with breathtaking mist-kissed views and cozy fireplaces.',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    1
  ).lastInsertRowid;

  const h4 = insertHotel.run(
    munnarId,
    'Tea County Munnar',
    'KTDC Hill Resort, Colony Road, Munnar 685612',
    4,
    '+91 486 523 0460',
    'Charming resort tucked between two green hills, offering trekking trails, Ayurvedic spa, and traditional hospitality.',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    0
  ).lastInsertRowid;

  const h5 = insertHotel.run(
    wayanadId,
    'Mountain Shadows Resort Wayanad',
    'Padinjarathara, Wayanad 673575',
    5,
    '+91 493 628 0000',
    'Private peninsula luxury eco-resort surrounded by shimmering lake waters and untouched Western Ghats forest.',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
    1
  ).lastInsertRowid;

  const h6 = insertHotel.run(
    kovalamId,
    'The Leela Kovalam Beach Resort',
    'Beach Road, Kovalam, Thiruvananthapuram 695527',
    5,
    '+91 471 305 1234',
    'A clifftop palace overlooking the Arabian Sea, featuring infinity pools, private beach access, and luxury wellness.',
    'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
    1
  ).lastInsertRowid;

  // 5. Insert Rooms
  const insertRoom = db.prepare(`
    INSERT INTO rooms (hotel_id, category_id, room_number, price_per_night, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  const hotelsList = [h1, h2, h3, h4, h5, h6];
  let firstRoomId = null;

  hotelsList.forEach((hotelId, idx) => {
    const basePrice = idx % 2 === 0 ? 5500 : 3200;

    const r1 = insertRoom.run(hotelId, catDeluxeAc, `101`, basePrice, 'available').lastInsertRowid;
    const r2 = insertRoom.run(hotelId, catDeluxeAc, `102`, basePrice, 'available').lastInsertRowid;
    const r3 = insertRoom.run(hotelId, catExecSuite, `201`, basePrice * 1.6, 'available').lastInsertRowid;
    const r4 = insertRoom.run(hotelId, catStdNonAc, `301`, basePrice * 0.5, 'available').lastInsertRowid;
    const r5 = insertRoom.run(hotelId, catStdDoubleNonAc, `302`, basePrice * 0.7, 'available').lastInsertRowid;
    const r6 = insertRoom.run(hotelId, catFamilyAc, `401`, basePrice * 1.9, 'available').lastInsertRowid;

    if (!firstRoomId) firstRoomId = r1;
  });

  // 6. Insert a Sample Reservation for the Demo User
  const insertReservation = db.prepare(`
    INSERT INTO reservations (
      booking_code, user_id, room_id, check_in, check_out, total_nights, total_price, status, guest_name, guest_contact
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReservation.run(
    'BK-10824',
    userId,
    firstRoomId,
    '2026-11-10',
    '2026-11-13',
    3,
    16500,
    'CONFIRMED',
    'Guest',
    '+91 98765 43210'
  );

  console.log('Seeding completed successfully!');
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase();
}
