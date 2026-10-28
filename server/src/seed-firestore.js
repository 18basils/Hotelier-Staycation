import bcrypt from 'bcryptjs';
import { db, usersCol, placesCol, hotelsCol, categoriesCol, roomsCol, reservationsCol } from './firestore.js';

export async function seedFirestore(force = false) {
  try {
    const hotelsSnap = await hotelsCol.limit(1).get();
    if (!hotelsSnap.empty && !force) {
      console.log('⚡ Firestore already contains data. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding Cloud Firestore with initial data...');

    // 1. Seed Users (preserve custom admin password if already set)
    const adminDoc = await usersCol.doc('admin').get();
    if (!adminDoc.exists) {
      const adminHash = bcrypt.hashSync('admin123', 10);
      await usersCol.doc('admin').set({
        username: 'admin',
        email: 'admin@hotelierstays.com',
        password_hash: adminHash,
        full_name: 'System Administrator',
        role: 'ADMIN',
        created_at: new Date().toISOString()
      });
    }

    const userRef = usersCol.doc('user');
    await userRef.set({
      username: 'user',
      email: 'user@example.com',
      password_hash: userHash,
      full_name: 'Basil Shaji',
      role: 'USER',
      created_at: new Date().toISOString()
    });

    // 2. Seed Places
    const placesData = [
      {
        id: 'kochi',
        name: 'Kochi',
        state: 'Kerala',
        image_url: 'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
        description: 'The Queen of the Arabian Sea, famous for colonial architecture, Chinese fishing nets, and backwaters.'
      },
      {
        id: 'munnar',
        name: 'Munnar',
        state: 'Kerala',
        image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        description: 'Idyllic rolling green tea gardens, misty hills, cool mountain breeze, and serene waterfalls.'
      },
      {
        id: 'wayanad',
        name: 'Wayanad',
        state: 'Kerala',
        image_url: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
        description: 'Lush rainforests, ancient caves, coffee plantations, and wildlife sanctuaries.'
      },
      {
        id: 'kovalam',
        name: 'Kovalam',
        state: 'Kerala',
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
        description: 'World-renowned coastal beach paradise with iconic striped lighthouses and golden shores.'
      }
    ];

    for (const place of placesData) {
      await placesCol.doc(place.id).set(place);
    }

    // 3. Seed Categories
    const categoriesData = [
      {
        id: 'deluxe-ac',
        name: 'Deluxe AC Room',
        ac: 'ac',
        beds: 2,
        capacity: 2,
        description: 'Comfortable climate-controlled room with king bed, balcony view, and modern amenities.',
        image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'exec-suite',
        name: 'Executive Suite AC',
        ac: 'ac',
        beds: 2,
        capacity: 4,
        description: 'Spacious suite featuring separate living area, panoramic views, and luxury bathroom.',
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'std-nonac',
        name: 'Standard Single Non-AC',
        ac: 'nonac',
        beds: 1,
        capacity: 1,
        description: 'Budget-friendly cozy single room with natural mountain air circulation and study desk.',
        image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'family-ac',
        name: 'Family Suite AC',
        ac: 'ac',
        beds: 3,
        capacity: 5,
        description: 'Ideal for families with children, offering 3 comfortable beds, dining space, and smart TV.',
        image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'
      },
      {
        id: 'std-double-nonac',
        name: 'Standard Double Non-AC',
        ac: 'nonac',
        beds: 2,
        capacity: 2,
        description: 'Economy double room featuring natural ventilation, twin beds, and en-suite shower.',
        image_url: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80'
      }
    ];

    for (const cat of categoriesData) {
      await categoriesCol.doc(cat.id).set(cat);
    }

    // 4. Seed Hotels
    const hotelsData = [
      {
        id: 'grand-hyatt-kochi',
        place_id: 'kochi',
        place_name: 'Kochi',
        place_state: 'Kerala',
        name: 'Grand Hyatt Kochi Bolgatty',
        address: 'Mulavukad, Bolgatty Island, Kochi, Kerala 682504',
        star_rating: 5,
        contact_no: '+91 484 266 1234',
        description: 'A waterfront luxury urban resort perched on Bolgatty Island with spectacular backwater views and signature dining.',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        featured: true,
        min_price: 2750,
        created_at: new Date().toISOString()
      },
      {
        id: 'old-harbour-hotel',
        place_id: 'kochi',
        place_name: 'Kochi',
        place_state: 'Kerala',
        name: 'Old Harbour Hotel Fort Kochi',
        address: '1/328 Tower Road, Fort Kochi, Kochi 682001',
        star_rating: 4,
        contact_no: '+91 484 221 8002',
        description: 'A 300-year-old heritage boutique hotel with Portuguese architecture, lush courtyard, and open-air swimming pool.',
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        featured: false,
        min_price: 1600,
        created_at: new Date().toISOString()
      },
      {
        id: 'fragrant-nature-munnar',
        place_id: 'munnar',
        place_name: 'Munnar',
        place_state: 'Kerala',
        name: 'Fragrant Nature Munnar',
        address: 'Pothamedu, Munnar, Kerala 685612',
        star_rating: 5,
        contact_no: '+91 486 523 0001',
        description: 'Luxury hill resort nestled in the heart of tea plantations with breathtaking mist-kissed views and cozy fireplaces.',
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        featured: true,
        min_price: 2750,
        created_at: new Date().toISOString()
      },
      {
        id: 'tea-county-munnar',
        place_id: 'munnar',
        place_name: 'Munnar',
        place_state: 'Kerala',
        name: 'Tea County Munnar',
        address: 'KTDC Hill Resort, Colony Road, Munnar 685612',
        star_rating: 4,
        contact_no: '+91 486 523 0460',
        description: 'Charming resort tucked between two green hills, offering trekking trails, Ayurvedic spa, and traditional hospitality.',
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        featured: false,
        min_price: 1600,
        created_at: new Date().toISOString()
      },
      {
        id: 'mountain-shadows-wayanad',
        place_id: 'wayanad',
        place_name: 'Wayanad',
        place_state: 'Kerala',
        name: 'Mountain Shadows Resort Wayanad',
        address: 'Padinjarathara, Wayanad 673575',
        star_rating: 5,
        contact_no: '+91 493 628 0000',
        description: 'Private peninsula luxury eco-resort surrounded by shimmering lake waters and untouched Western Ghats forest.',
        image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        featured: true,
        min_price: 2750,
        created_at: new Date().toISOString()
      },
      {
        id: 'leela-kovalam-beach',
        place_id: 'kovalam',
        place_name: 'Kovalam',
        place_state: 'Kerala',
        name: 'The Leela Kovalam Beach Resort',
        address: 'Beach Road, Kovalam, Thiruvananthapuram 695527',
        star_rating: 5,
        contact_no: '+91 471 305 1234',
        description: 'A clifftop palace overlooking the Arabian Sea, featuring infinity pools, private beach access, and luxury wellness.',
        image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
        featured: true,
        min_price: 1600,
        created_at: new Date().toISOString()
      }
    ];

    for (const h of hotelsData) {
      await hotelsCol.doc(h.id).set(h);
    }

    // 5. Seed Rooms
    let firstRoomDoc = null;
    for (let i = 0; i < hotelsData.length; i++) {
      const hotel = hotelsData[i];
      const basePrice = i % 2 === 0 ? 5500 : 3200;

      const roomSpecs = [
        { num: '101', catId: 'deluxe-ac', catName: 'Deluxe AC Room', ac: 'ac', beds: 2, cap: 2, price: basePrice },
        { num: '102', catId: 'deluxe-ac', catName: 'Deluxe AC Room', ac: 'ac', beds: 2, cap: 2, price: basePrice },
        { num: '201', catId: 'exec-suite', catName: 'Executive Suite AC', ac: 'ac', beds: 2, cap: 4, price: basePrice * 1.6 },
        { num: '301', catId: 'std-nonac', catName: 'Standard Single Non-AC', ac: 'nonac', beds: 1, cap: 1, price: basePrice * 0.5 },
        { num: '302', catId: 'std-double-nonac', catName: 'Standard Double Non-AC', ac: 'nonac', beds: 2, cap: 2, price: basePrice * 0.7 },
        { num: '401', catId: 'family-ac', catName: 'Family Suite AC', ac: 'ac', beds: 3, cap: 5, price: basePrice * 1.9 }
      ];

      for (const spec of roomSpecs) {
        const roomDoc = roomsCol.doc(`${hotel.id}-${spec.num}`);
        const roomPayload = {
          id: roomDoc.id,
          hotel_id: hotel.id,
          hotel_name: hotel.name,
          category_id: spec.catId,
          category_name: spec.catName,
          ac: spec.ac,
          beds: spec.beds,
          capacity: spec.cap,
          room_number: spec.num,
          price_per_night: Math.round(spec.price),
          status: 'available',
          created_at: new Date().toISOString()
        };
        await roomDoc.set(roomPayload);
        if (!firstRoomDoc) firstRoomDoc = roomPayload;
      }
    }

    // 6. Seed Sample Reservation
    if (firstRoomDoc) {
      const resDoc = reservationsCol.doc('res-sample-1');
      await resDoc.set({
        id: resDoc.id,
        booking_code: 'BK-10824',
        user_id: 'user',
        username: 'user',
        hotel_id: firstRoomDoc.hotel_id,
        hotel_name: firstRoomDoc.hotel_name,
        hotel_address: 'Mulavukad, Bolgatty Island, Kochi, Kerala 682504',
        hotel_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        room_id: firstRoomDoc.id,
        room_number: firstRoomDoc.room_number,
        category_name: firstRoomDoc.category_name,
        ac: firstRoomDoc.ac,
        beds: firstRoomDoc.beds,
        check_in: '2026-11-10',
        check_out: '2026-11-13',
        total_nights: 3,
        total_price: firstRoomDoc.price_per_night * 3,
        status: 'CONFIRMED',
        guest_name: 'Basil Shaji',
        guest_contact: '+91 98765 43210',
        special_requests: 'Sea-facing or high-floor room preferred',
        created_at: new Date().toISOString()
      });
    }

    console.log('✅ Firestore seeded successfully with all collections!');
  } catch (err) {
    console.error('❌ Firestore seeding error:', err);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed-firestore.js')) {
  seedFirestore(true);
}
