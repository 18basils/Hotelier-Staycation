import bcrypt from 'bcryptjs';
import { db, usersCol, placesCol, hotelsCol, categoriesCol, roomsCol, reservationsCol, reviewsCol, couponsCol } from './firestore.js';

export async function seedFirestore(force = false) {
  try {
    const hotelsSnap = await hotelsCol.limit(1).get();
    if (!hotelsSnap.empty && !force) {
      console.log('⚡ Firestore already contains data. Ensuring coupons & reviews exist...');
      await seedCouponsAndReviewsOnly();
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

    const userHash = bcrypt.hashSync('user123', 10);
    const userRef = usersCol.doc('user');
    await userRef.set({
      username: 'user',
      email: 'user@example.com',
      password_hash: userHash,
      full_name: 'Guest',
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
        description: 'Lush spice plantations, prehistoric caves, and misty Western Ghats biodiversity reserves.'
      },
      {
        id: 'kovalam',
        name: 'Kovalam',
        state: 'Kerala',
        image_url: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
        description: 'World-renowned crescent beaches, iconic striped lighthouse, Ayurvedic wellness, and Arabian Sea sunsets.'
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

    // 4. Seed Hotels with rich Amenities, Coordinates & Photo Galleries (v3.2.0)
    const hotelsData = [
      {
        id: 'grand-hyatt-kochi',
        place_id: 'kochi',
        place_name: 'Kochi',
        place_state: 'Kerala',
        name: 'Grand Hyatt Kochi Bolgatty',
        address: 'Mulavukad, Bolgatty Island, Kochi, Kerala 682504',
        latitude: 9.9885,
        longitude: 76.2657,
        star_rating: 5,
        average_rating: 4.9,
        review_count: 18,
        contact_no: '+91 484 266 1234',
        description: 'A waterfront luxury urban resort perched on Bolgatty Island with spectacular backwater views, rooftop heli-pad, and signature dining.',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        min_price: 2750,
        amenities: ['wifi', 'pool', 'spa', 'breakfast', 'ev', 'sea_view', 'parking', 'restaurant', 'gym'],
        created_at: new Date().toISOString()
      },
      {
        id: 'old-harbour-hotel',
        place_id: 'kochi',
        place_name: 'Kochi',
        place_state: 'Kerala',
        name: 'Old Harbour Hotel Fort Kochi',
        address: '1/328 Tower Road, Fort Kochi, Kochi 682001',
        latitude: 9.9657,
        longitude: 76.2415,
        star_rating: 4,
        average_rating: 4.6,
        review_count: 12,
        contact_no: '+91 484 221 8002',
        description: 'A 300-year-old heritage boutique hotel with Portuguese architecture, lush courtyard, and open-air swimming pool.',
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: false,
        min_price: 1600,
        amenities: ['wifi', 'pool', 'breakfast', 'restaurant', 'parking', 'pet'],
        created_at: new Date().toISOString()
      },
      {
        id: 'fragrant-nature-munnar',
        place_id: 'munnar',
        place_name: 'Munnar',
        place_state: 'Kerala',
        name: 'Fragrant Nature Munnar',
        address: 'Pothamedu, Munnar, Kerala 685612',
        latitude: 10.0381,
        longitude: 77.0125,
        star_rating: 5,
        average_rating: 4.8,
        review_count: 15,
        contact_no: '+91 486 523 0001',
        description: 'Luxury hill resort nestled in the heart of tea plantations with breathtaking mist-kissed views and cozy fireplaces.',
        image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        min_price: 2750,
        amenities: ['wifi', 'spa', 'breakfast', 'sea_view', 'restaurant', 'parking'],
        created_at: new Date().toISOString()
      },
      {
        id: 'tea-county-munnar',
        place_id: 'munnar',
        place_name: 'Munnar',
        place_state: 'Kerala',
        name: 'Tea County Munnar',
        address: 'KTDC Hill Resort, Colony Road, Munnar 685612',
        latitude: 10.0889,
        longitude: 77.0595,
        star_rating: 4,
        average_rating: 4.4,
        review_count: 9,
        contact_no: '+91 486 523 0460',
        description: 'Charming resort tucked between two green hills, offering trekking trails, Ayurvedic spa, and traditional hospitality.',
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: false,
        min_price: 1600,
        amenities: ['wifi', 'breakfast', 'restaurant', 'parking', 'gym'],
        created_at: new Date().toISOString()
      },
      {
        id: 'mountain-shadows-wayanad',
        place_id: 'wayanad',
        place_name: 'Wayanad',
        place_state: 'Kerala',
        name: 'Mountain Shadows Resort Wayanad',
        address: 'Padinjarathara, Wayanad 673575',
        latitude: 11.5833,
        longitude: 76.0167,
        star_rating: 5,
        average_rating: 4.9,
        review_count: 22,
        contact_no: '+91 493 628 0000',
        description: 'Private peninsula luxury eco-resort surrounded by shimmering lake waters and untouched Western Ghats forest.',
        image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        min_price: 2750,
        amenities: ['wifi', 'pool', 'spa', 'breakfast', 'ev', 'sea_view', 'parking', 'restaurant'],
        created_at: new Date().toISOString()
      },
      {
        id: 'leela-kovalam-beach',
        place_id: 'kovalam',
        place_name: 'Kovalam',
        place_state: 'Kerala',
        name: 'The Leela Kovalam Beach Resort',
        address: 'Beach Road, Kovalam, Thiruvananthapuram 695527',
        latitude: 8.3842,
        longitude: 76.9782,
        star_rating: 5,
        average_rating: 4.9,
        review_count: 26,
        contact_no: '+91 471 305 1234',
        description: 'A clifftop palace overlooking the Arabian Sea, featuring infinity pools, private beach access, and luxury wellness.',
        image_url: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
        ],
        featured: true,
        min_price: 1600,
        amenities: ['wifi', 'pool', 'spa', 'breakfast', 'sea_view', 'parking', 'restaurant', 'gym'],
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

    // 6. Seed Sample Reservation with Price Breakdown & Payment Details
    if (firstRoomDoc) {
      const resDoc = reservationsCol.doc('res-sample-1');
      const baseFare = firstRoomDoc.price_per_night * 3;
      const taxAmount = Math.round(baseFare * 0.12);
      const serviceFee = 199;
      const totalAmount = baseFare + taxAmount + serviceFee;

      await resDoc.set({
        id: resDoc.id,
        booking_code: 'BK-10824',
        bookingCode: 'BK-10824',
        user_id: 'user',
        username: 'user',
        hotel_id: firstRoomDoc.hotel_id,
        hotel_name: firstRoomDoc.hotel_name,
        hotel_address: 'Mulavukad, Bolgatty Island, Kochi, Kerala 682504',
        hotel_image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
        hotel_contact: '+91 484 266 1234',
        room_id: firstRoomDoc.id,
        room_number: firstRoomDoc.room_number,
        category_name: firstRoomDoc.category_name,
        ac: firstRoomDoc.ac,
        beds: firstRoomDoc.beds,
        check_in: '2026-11-10',
        check_out: '2026-11-13',
        total_nights: 3,
        base_fare: baseFare,
        tax_amount: taxAmount,
        service_fee: serviceFee,
        discount_amount: 0,
        coupon_code: null,
        total_price: totalAmount,
        payment_status: 'PAID',
        payment_method: 'UPI - Google Pay',
        transaction_id: 'PAY-RZP-928174',
        paid_at: new Date().toISOString(),
        status: 'CONFIRMED',
        guest_name: 'Guest',
        guest_contact: '+91 98765 43210',
        special_requests: 'Sea-facing or high-floor room preferred',
        created_at: new Date().toISOString()
      });
    }

    await seedCouponsAndReviewsOnly();

    console.log('✅ Firestore seeded successfully with all collections!');
  } catch (err) {
    console.error('❌ Firestore seeding error:', err);
  }
}

export async function seedCouponsAndReviewsOnly() {
  try {
    // Seed Coupons
    const coupons = [
      {
        code: 'WELCOME20',
        discount_type: 'PERCENTAGE',
        discount_value: 20,
        max_discount: 2000,
        min_booking_value: 1000,
        active: true,
        description: '20% off on your staycation (up to ₹2,000)'
      },
      {
        code: 'MONSOON15',
        discount_type: 'PERCENTAGE',
        discount_value: 15,
        max_discount: 1500,
        min_booking_value: 2000,
        active: true,
        description: '15% off seasonal discount (up to ₹1,500)'
      },
      {
        code: 'FLAT500',
        discount_type: 'FLAT',
        discount_value: 500,
        max_discount: 500,
        min_booking_value: 3000,
        active: true,
        description: 'Flat ₹500 discount on bookings above ₹3,000'
      },
      {
        code: 'STAYCATION10',
        discount_type: 'PERCENTAGE',
        discount_value: 10,
        max_discount: 1000,
        min_booking_value: 1500,
        active: true,
        description: '10% instant discount on all room categories'
      }
    ];

    for (const c of coupons) {
      await couponsCol.doc(c.code).set(c);
    }

    // Seed Verified Reviews
    const sampleReviews = [
      {
        id: 'rev-hyatt-1',
        hotel_id: 'grand-hyatt-kochi',
        reservation_id: 'res-sample-1',
        user_id: 'user',
        username: 'user',
        user_full_name: 'Priya Nambiar',
        rating: 5,
        comment: 'Exquisite property! The backwater views from our balcony were serene, and the complimentary breakfast was phenomenal.',
        verified: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString()
      },
      {
        id: 'rev-hyatt-2',
        hotel_id: 'grand-hyatt-kochi',
        reservation_id: 'res-sample-2',
        user_id: 'user_rahul',
        username: 'rahul_k',
        user_full_name: 'Rahul Menon',
        rating: 5,
        comment: 'Top tier hospitality. Fast check-in process, pristine swimming pool, and easy EV charging facility.',
        verified: true,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString()
      },
      {
        id: 'rev-munnar-1',
        hotel_id: 'fragrant-nature-munnar',
        reservation_id: 'res-sample-3',
        user_id: 'user_anita',
        username: 'anita_s',
        user_full_name: 'Anita Sharma',
        rating: 5,
        comment: 'Waking up to the mist over the tea plantations is an unforgettable experience. The fireplace in the suite made evenings cozy!',
        verified: true,
        created_at: new Date(Date.now() - 5 * 86400000).toISOString()
      },
      {
        id: 'rev-wayanad-1',
        hotel_id: 'mountain-shadows-wayanad',
        reservation_id: 'res-sample-4',
        user_id: 'user_kiran',
        username: 'kiran_v',
        user_full_name: 'Kiran Varma',
        rating: 5,
        comment: 'A true tropical paradise surrounded by water and rainforest. The spa treatment was world-class.',
        verified: true,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString()
      }
    ];

    for (const rev of sampleReviews) {
      await reviewsCol.doc(rev.id).set(rev);
    }

    // Ensure hotels in Firestore have coordinates and image galleries
    const hotelsToEnrich = {
      'grand-hyatt-kochi': {
        latitude: 9.9885,
        longitude: 76.2657,
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      'old-harbour-hotel': {
        latitude: 9.9657,
        longitude: 76.2415,
        images: [
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      'fragrant-nature-munnar': {
        latitude: 10.0381,
        longitude: 77.0125,
        images: [
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      'tea-county-munnar': {
        latitude: 10.0889,
        longitude: 77.0595,
        images: [
          'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      'mountain-shadows-wayanad': {
        latitude: 11.5833,
        longitude: 76.0167,
        images: [
          'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      'leela-kovalam-beach': {
        latitude: 8.3842,
        longitude: 76.9782,
        images: [
          'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    };

    for (const [hotelId, enrichData] of Object.entries(hotelsToEnrich)) {
      try {
        await hotelsCol.doc(hotelId).set(enrichData, { merge: true });
      } catch (e) {
        // Continue if document does not exist yet
      }
    }
  } catch (err) {
    console.error('Error seeding coupons/reviews:', err);
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed-firestore.js')) {
  seedFirestore(true);
}
