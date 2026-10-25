const Flight = require('./models/Flight');
const Train = require('./models/Train');
const Bus = require('./models/Bus');
const Hotel = require('./models/Hotel');

const seedFlights = [
  {
    airline: 'Emirates',
    airlineCode: 'EK',
    flightNumber: 'EK-512',
    fromCity: 'Delhi',
    fromAirport: 'Indira Gandhi International Airport',
    fromCode: 'DEL',
    toCity: 'Dubai',
    toAirport: 'Dubai International Airport',
    toCode: 'DXB',
    departureTime: '09:15',
    arrivalTime: '11:45',
    duration: '3h 30m',
    stops: 0,
    stopDetails: 'Non-stop',
    baggage: { cabin: '7 kg', checkin: '30 kg' },
    classes: [
      { name: 'Economy', price: 24500, availableSeats: 45 },
      { name: 'Premium Economy', price: 38000, availableSeats: 18 },
      { name: 'Business', price: 72000, availableSeats: 8 },
      { name: 'First Class', price: 145000, availableSeats: 4 }
    ],
    mealsIncluded: true,
    refundable: true
  },
  {
    airline: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI-102',
    fromCity: 'Delhi',
    fromAirport: 'Indira Gandhi International Airport',
    fromCode: 'DEL',
    toCity: 'Mumbai',
    toAirport: 'Chhatrapati Shivaji Maharaj Intl Airport',
    toCode: 'BOM',
    departureTime: '07:00',
    arrivalTime: '09:15',
    duration: '2h 15m',
    stops: 0,
    stopDetails: 'Non-stop',
    baggage: { cabin: '7 kg', checkin: '25 kg' },
    classes: [
      { name: 'Economy', price: 5850, availableSeats: 50 },
      { name: 'Premium Economy', price: 8400, availableSeats: 20 },
      { name: 'Business', price: 18200, availableSeats: 12 }
    ],
    mealsIncluded: true,
    refundable: true
  },
  {
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E-458',
    fromCity: 'Delhi',
    fromAirport: 'Indira Gandhi International Airport',
    fromCode: 'DEL',
    toCity: 'Goa',
    toAirport: 'Manohar International Airport (MOPA)',
    toCode: 'GOX',
    departureTime: '11:20',
    arrivalTime: '13:55',
    duration: '2h 35m',
    stops: 0,
    stopDetails: 'Non-stop',
    baggage: { cabin: '7 kg', checkin: '15 kg' },
    classes: [
      { name: 'Economy', price: 5200, availableSeats: 35 },
      { name: 'Premium Economy', price: 8100, availableSeats: 15 }
    ],
    mealsIncluded: false,
    refundable: true
  },
  {
    airline: 'Singapore Airlines',
    airlineCode: 'SQ',
    flightNumber: 'SQ-401',
    fromCity: 'Mumbai',
    fromAirport: 'Chhatrapati Shivaji Maharaj Intl Airport',
    fromCode: 'BOM',
    toCity: 'Singapore',
    toAirport: 'Singapore Changi Airport',
    toCode: 'SIN',
    departureTime: '11:45',
    arrivalTime: '19:50',
    duration: '5h 35m',
    stops: 0,
    stopDetails: 'Non-stop',
    baggage: { cabin: '7 kg', checkin: '30 kg' },
    classes: [
      { name: 'Economy', price: 22500, availableSeats: 40 },
      { name: 'Premium Economy', price: 36000, availableSeats: 16 },
      { name: 'Business', price: 84000, availableSeats: 10 }
    ],
    mealsIncluded: true,
    refundable: true
  },
  {
    airline: 'Qatar Airways',
    airlineCode: 'QR',
    flightNumber: 'QR-571',
    fromCity: 'Delhi',
    fromAirport: 'Indira Gandhi International Airport',
    fromCode: 'DEL',
    toCity: 'Maldives',
    toAirport: 'Velana International Airport (Male)',
    toCode: 'MLE',
    departureTime: '03:40',
    arrivalTime: '10:10',
    duration: '6h 30m',
    stops: 1,
    stopDetails: '1 Stop via Doha (1h 15m layover)',
    baggage: { cabin: '7 kg', checkin: '30 kg' },
    classes: [
      { name: 'Economy', price: 28900, availableSeats: 30 },
      { name: 'Business', price: 79000, availableSeats: 6 }
    ],
    mealsIncluded: true,
    refundable: true
  },
  {
    airline: 'Vistara',
    airlineCode: 'UK',
    flightNumber: 'UK-817',
    fromCity: 'Bangalore',
    fromAirport: 'Kempegowda International Airport',
    fromCode: 'BLR',
    toCity: 'Delhi',
    toAirport: 'Indira Gandhi International Airport',
    toCode: 'DEL',
    departureTime: '18:10',
    arrivalTime: '20:55',
    duration: '2h 45m',
    stops: 0,
    stopDetails: 'Non-stop',
    baggage: { cabin: '7 kg', checkin: '20 kg' },
    classes: [
      { name: 'Economy', price: 6450, availableSeats: 45 },
      { name: 'Premium Economy', price: 9200, availableSeats: 16 },
      { name: 'Business', price: 19800, availableSeats: 8 }
    ],
    mealsIncluded: true,
    refundable: true
  }
];

const seedTrains = [
  {
    trainNumber: '12002',
    trainName: 'Bhopal Shatabdi Express',
    fromStation: 'New Delhi Railway Station',
    fromCode: 'NDLS',
    toStation: 'Agra Cantt Railway Station',
    toCode: 'AGC',
    fromCity: 'Delhi',
    toCity: 'Agra',
    departureTime: '06:00',
    arrivalTime: '07:50',
    duration: '1h 50m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 1240, availableSeats: 64, statusText: 'AVAILABLE-64' },
      { classCode: 'EC', className: 'Exec. Chair Car', fare: 2350, availableSeats: 18, statusText: 'AVAILABLE-18' }
    ],
    pantryAvailable: true
  },
  {
    trainNumber: '12952',
    trainName: 'Mumbai Rajdhani Express',
    fromStation: 'New Delhi Railway Station',
    fromCode: 'NDLS',
    toStation: 'Mumbai Central',
    toCode: 'MMCT',
    fromCity: 'Delhi',
    toCity: 'Mumbai',
    departureTime: '16:55',
    arrivalTime: '08:35',
    duration: '15h 40m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { classCode: '3A', className: 'AC 3 Tier', fare: 1850, availableSeats: 42, statusText: 'AVAILABLE-42' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 2650, availableSeats: 21, statusText: 'AVAILABLE-21' },
      { classCode: '1A', className: 'AC First Class', fare: 4250, availableSeats: 6, statusText: 'AVAILABLE-6' }
    ],
    pantryAvailable: true
  },
  {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express',
    fromStation: 'New Delhi Railway Station',
    fromCode: 'NDLS',
    toStation: 'Varanasi Junction',
    toCode: 'BSB',
    fromCity: 'Delhi',
    toCity: 'Varanasi',
    departureTime: '06:00',
    arrivalTime: '14:00',
    duration: '8h 00m',
    runningDays: ['Tue', 'Wed', 'Fri', 'Sat', 'Sun'],
    classes: [
      { classCode: 'CC', className: 'AC Chair Car', fare: 1750, availableSeats: 58, statusText: 'AVAILABLE-58' },
      { classCode: 'EC', className: 'Exec. Chair Car', fare: 3300, availableSeats: 12, statusText: 'AVAILABLE-12' }
    ],
    pantryAvailable: true
  },
  {
    trainNumber: '12414',
    trainName: 'Pooja Superfast Express',
    fromStation: 'Delhi Junction',
    fromCode: 'DLI',
    toStation: 'Jaipur Junction',
    toCode: 'JP',
    fromCity: 'Delhi',
    toCity: 'Jaipur',
    departureTime: '21:50',
    arrivalTime: '03:20',
    duration: '5h 30m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 420, availableSeats: 82, statusText: 'AVAILABLE-82' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 1150, availableSeats: 34, statusText: 'AVAILABLE-34' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 1650, availableSeats: 14, statusText: 'AVAILABLE-14' }
    ],
    pantryAvailable: false
  },
  {
    trainNumber: '12628',
    trainName: 'Karnataka Express',
    fromStation: 'New Delhi Railway Station',
    fromCode: 'NDLS',
    toStation: 'KSR Bengaluru',
    toCode: 'SBC',
    fromCity: 'Delhi',
    toCity: 'Bangalore',
    departureTime: '20:20',
    arrivalTime: '12:00',
    duration: '39h 40m',
    runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    classes: [
      { classCode: 'SL', className: 'Sleeper Class', fare: 780, availableSeats: 48, statusText: 'AVAILABLE-48' },
      { classCode: '3A', className: 'AC 3 Tier', fare: 2150, availableSeats: 26, statusText: 'AVAILABLE-26' },
      { classCode: '2A', className: 'AC 2 Tier', fare: 3150, availableSeats: 10, statusText: 'AVAILABLE-10' }
    ],
    pantryAvailable: true
  }
];

function generateSeats(basePrice) {
  const seats = [];
  // Lower Deck: 12 Seater/Sleeper seats
  for (let i = 1; i <= 12; i++) {
    const isBooked = [2, 5, 9].includes(i);
    seats.push({
      seatNumber: `L${i}`,
      deck: 'lower',
      type: i > 8 ? 'sleeper' : 'seater',
      isBooked,
      genderPreference: i === 4 ? 'female' : 'all',
      price: i > 8 ? basePrice + 200 : basePrice
    });
  }
  // Upper Deck: 12 Sleeper berths
  for (let i = 1; i <= 12; i++) {
    const isBooked = [1, 6, 11].includes(i);
    seats.push({
      seatNumber: `U${i}`,
      deck: 'upper',
      type: 'sleeper',
      isBooked,
      genderPreference: i === 7 ? 'female' : 'all',
      price: basePrice + 300
    });
  }
  return seats;
}

const seedBuses = [
  {
    busNumber: 'TF-BUS-101',
    operatorName: 'Zingbus Luxe Royal',
    busType: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)',
    fromCity: 'Delhi',
    toCity: 'Manali',
    boardingPoints: [
      { location: 'Kashmere Gate ISBT', time: '20:00' },
      { location: 'Majnu Ka Tilla', time: '20:30' }
    ],
    droppingPoints: [
      { location: 'Mall Road, Manali', time: '08:30' },
      { location: 'Private Bus Stand', time: '09:00' }
    ],
    departureTime: '20:00',
    arrivalTime: '08:30',
    duration: '12h 30m',
    basePrice: 1450,
    rating: 4.8,
    reviewsCount: 420,
    amenities: ['Live Tracking', 'Blanket & Pillow', 'Charging Point', 'Free WiFi', 'Water Bottle', 'Emergency Exit'],
    totalSeats: 24,
    seats: generateSeats(1450)
  },
  {
    busNumber: 'TF-BUS-102',
    operatorName: 'IntrCity SmartBus Premium',
    busType: 'BharatBenz AC Seater/Sleeper (2+1)',
    fromCity: 'Delhi',
    toCity: 'Jaipur',
    boardingPoints: [
      { location: 'Dhaula Kuan Metro', time: '07:30' },
      { location: 'IFFCO Chowk, Gurgaon', time: '08:15' }
    ],
    droppingPoints: [
      { location: 'Sindhi Camp', time: '13:00' },
      { location: 'Narayan Singh Circle', time: '13:30' }
    ],
    departureTime: '07:30',
    arrivalTime: '13:00',
    duration: '5h 30m',
    basePrice: 650,
    rating: 4.7,
    reviewsCount: 310,
    amenities: ['Live Tracking', 'Air Suspension', 'Charging Point', 'Water Bottle', 'Snack Pack'],
    totalSeats: 24,
    seats: generateSeats(650)
  },
  {
    busNumber: 'TF-BUS-103',
    operatorName: 'VRL Travels Express',
    busType: 'Scania Multi-Axle Luxury A/C Sleeper',
    fromCity: 'Mumbai',
    toCity: 'Goa',
    boardingPoints: [
      { location: 'Borivali East', time: '19:30' },
      { location: 'Vashi Plaza', time: '21:00' }
    ],
    droppingPoints: [
      { location: 'Mapusa Bus Stand', time: '07:30' },
      { location: 'Panjim KTC', time: '08:15' }
    ],
    departureTime: '19:30',
    arrivalTime: '08:00',
    duration: '12h 30m',
    basePrice: 1650,
    rating: 4.9,
    reviewsCount: 560,
    amenities: ['Live Tracking', 'Blanket', 'Reading Light', 'Charging Point', 'Water Bottle', 'WiFi'],
    totalSeats: 24,
    seats: generateSeats(1650)
  },
  {
    busNumber: 'TF-BUS-104',
    operatorName: 'Orange Travels Super Luxe',
    busType: 'Mercedes Benz Multi-Axle A/C Sleeper',
    fromCity: 'Bangalore',
    toCity: 'Goa',
    boardingPoints: [
      { location: 'Majestic Anand Rao Circle', time: '21:00' },
      { location: 'Yeshwantpur', time: '21:45' }
    ],
    droppingPoints: [
      { location: 'Margao KTC', time: '07:45' },
      { location: 'Panaji', time: '08:30' }
    ],
    departureTime: '21:00',
    arrivalTime: '08:00',
    duration: '11h 00m',
    basePrice: 1550,
    rating: 4.6,
    reviewsCount: 280,
    amenities: ['Live Tracking', 'Blanket', 'Water Bottle', 'Charging Point'],
    totalSeats: 24,
    seats: generateSeats(1550)
  }
];

const seedHotels = [
  {
    name: 'The Grand Sunset Palace & Spa',
    city: 'Goa',
    address: 'Calangute - Baga Road, North Goa, 403516',
    location: 'Calangute Beachfront, North Goa',
    starRating: 5,
    userRating: 4.9,
    reviewsCount: 680,
    image: './frontend/assets/images/popular-1.jpg',
    gallery: [
      './frontend/assets/images/popular-1.jpg',
      './frontend/assets/images/packege-1.jpg',
      './frontend/assets/images/gallery-1.jpg'
    ],
    description: 'Experience pure luxury overlooking the Arabian Sea with private beach access, a multi-tier infinity pool, bespoke Ayurvedic spa therapies, and Michelin-inspired sunset dining.',
    amenities: ['Private Beach', 'Infinity Pool', 'Luxury Spa', 'Free High-Speed WiFi', '24/7 Room Service', 'Airport Shuttle', 'Fine Dining Bar'],
    startingPrice: 7500,
    rooms: [
      {
        roomId: 'GOA-DLX-01',
        roomType: 'Deluxe Ocean View Room',
        pricePerNight: 7500,
        maxGuests: 2,
        bedType: '1 King Bed',
        size: '420 sq.ft',
        amenities: ['Ocean Balcony', 'Bathtub', 'Espresso Machine', 'Smart 55" TV', 'Mini Bar'],
        availableCount: 8,
        image: './frontend/assets/images/packege-1.jpg'
      },
      {
        roomId: 'GOA-STE-02',
        roomType: 'Executive Sunset Panoramic Suite',
        pricePerNight: 12500,
        maxGuests: 3,
        bedType: '1 King Bed + 1 Sofa Bed',
        size: '650 sq.ft',
        amenities: ['Private Jacuzzi', 'Sunset Deck', 'Complimentary Wine', 'Lounge Access'],
        availableCount: 4,
        image: './frontend/assets/images/popular-1.jpg'
      },
      {
        roomId: 'GOA-VLA-03',
        roomType: 'Presidential Private Pool Villa',
        pricePerNight: 24000,
        maxGuests: 4,
        bedType: '2 King Beds',
        size: '1200 sq.ft',
        amenities: ['Private Plunge Pool', 'Personal Butler', 'Private Chef Service', 'Beach Gazebo'],
        availableCount: 2,
        image: './frontend/assets/images/gallery-2.jpg'
      }
    ]
  },
  {
    name: 'Al-Noor Burj Skyline Luxury Suites',
    city: 'Dubai',
    address: 'Sheikh Mohammed bin Rashid Blvd, Downtown Dubai, UAE',
    location: 'Downtown Dubai (Adjacent to Burj Khalifa & Dubai Mall)',
    starRating: 5,
    userRating: 4.8,
    reviewsCount: 1120,
    image: './frontend/assets/images/popular-2.jpg',
    gallery: [
      './frontend/assets/images/popular-2.jpg',
      './frontend/assets/images/gallery-3.jpg'
    ],
    description: 'Immerse in unparalleled Arabian luxury with floor-to-ceiling panoramic views of Burj Khalifa and the Dubai Fountains, personalized concierge, and rooftop infinity lounge.',
    amenities: ['Burj Khalifa View', 'Rooftop Infinity Pool', 'Chauffeur Service', 'Spa & Wellness', 'Valet Parking', 'Free High-Speed WiFi'],
    startingPrice: 18500,
    rooms: [
      {
        roomId: 'DXB-SKY-01',
        roomType: 'Burj View Deluxe Suite',
        pricePerNight: 18500,
        maxGuests: 2,
        bedType: '1 King Bed',
        size: '500 sq.ft',
        amenities: ['Burj Khalifa View', 'Marble Bath', 'Smart Room Controls', 'Nespresso'],
        availableCount: 6,
        image: './frontend/assets/images/popular-2.jpg'
      },
      {
        roomId: 'DXB-ROY-02',
        roomType: 'Royal Penthouse Skyline Suite',
        pricePerNight: 42000,
        maxGuests: 4,
        bedType: '2 King Beds',
        size: '1100 sq.ft',
        amenities: ['360 Skyline Panorama', 'Private Terrace', 'Jacuzzi', 'Dedicated Concierge'],
        availableCount: 2,
        image: './frontend/assets/images/gallery-3.jpg'
      }
    ]
  },
  {
    name: 'Kyoto Zen Garden Pavilion & Ryokan',
    city: 'Kyoto',
    address: 'Higashiyama Ward, Kyoto 605-0862, Japan',
    location: 'Higashiyama Historical Quarter, Kyoto',
    starRating: 5,
    userRating: 4.9,
    reviewsCount: 840,
    image: './frontend/assets/images/popular-3.jpg',
    gallery: [
      './frontend/assets/images/popular-3.jpg',
      './frontend/assets/images/gallery-4.jpg'
    ],
    description: 'Traditional Japanese serenity meets five-star luxury. Enjoy natural cedarwood Onsen hot spring baths, Michelin Kaiseki dining, and private Zen rock garden views.',
    amenities: ['Private Onsen Hot Spring', 'Kaiseki Breakfast', 'Zen Garden', 'Tea Ceremony Pavilion', 'Free WiFi', 'Yukata Robes'],
    startingPrice: 16000,
    rooms: [
      {
        roomId: 'KYO-RYO-01',
        roomType: 'Traditional Tatami Zen Suite',
        pricePerNight: 16000,
        maxGuests: 2,
        bedType: 'Luxury Futon bedding',
        size: '480 sq.ft',
        amenities: ['Private Wooden Onsen', 'Zen Garden View', 'Matcha Tea Set', 'Aromatherapy'],
        availableCount: 5,
        image: './frontend/assets/images/popular-3.jpg'
      },
      {
        roomId: 'KYO-VLA-02',
        roomType: 'Imperial Garden Pavilion Villa',
        pricePerNight: 32000,
        maxGuests: 4,
        bedType: '2 Japanese King Suites',
        size: '950 sq.ft',
        amenities: ['Outdoor Stone Onsen', 'Private Bamboo Courtyard', 'Kaiseki Dining Included'],
        availableCount: 2,
        image: './frontend/assets/images/gallery-4.jpg'
      }
    ]
  },
  {
    name: 'Jaipur Heritage Haveli & Palace',
    city: 'Jaipur',
    address: 'Amber Fort Road, Amer, Jaipur, Rajasthan 302028',
    location: 'Near Amber Fort & Jal Mahal, Jaipur',
    starRating: 5,
    userRating: 4.8,
    reviewsCount: 490,
    image: './frontend/assets/images/packege-3.jpg',
    gallery: [
      './frontend/assets/images/packege-3.jpg',
      './frontend/assets/images/gallery-5.jpg'
    ],
    description: 'Relive royal Rajputana splendor with arched hand-painted corridors, majestic peacock courtyards, folk musical evenings, and royal Rajasthani thali banquets.',
    amenities: ['Royal Courtyard Pool', 'Heritage Architecture', 'Folk Music Evenings', 'Ayurvedic Spa', 'Free WiFi', 'Royal Banquet'],
    startingPrice: 6800,
    rooms: [
      {
        roomId: 'JAI-ROY-01',
        roomType: 'Maharaja Royal Heritage Room',
        pricePerNight: 6800,
        maxGuests: 2,
        bedType: '1 Four-Poster King Bed',
        size: '400 sq.ft',
        amenities: ['Palace Courtyard View', 'Antique Furnishings', 'Brass Bathtub'],
        availableCount: 7,
        image: './frontend/assets/images/packege-3.jpg'
      },
      {
        roomId: 'JAI-PRN-02',
        roomType: 'Princely Suite with Private Terrace',
        pricePerNight: 11500,
        maxGuests: 3,
        bedType: '1 King Bed + 1 Diwan',
        size: '620 sq.ft',
        amenities: ['Fort View Terrace', 'Royal Butler Service', 'Jacuzzi'],
        availableCount: 3,
        image: './frontend/assets/images/gallery-5.jpg'
      }
    ]
  }
];

const User = require('./models/User');
const PackageBooking = require('./models/PackageBooking');
const TrainBooking = require('./models/TrainBooking');
const Inquiry = require('./models/Inquiry');
const Payment = require('./models/Payment');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    let demoUser = await User.findOne({ username: 'wanderer' });
    if (!demoUser) {
      const hash = await bcrypt.hash('password123', 10);
      demoUser = await User.create({
        username: 'wanderer',
        password: hash,
        name: 'Alex Explorer',
        email: 'wanderer@tourfever.com',
        phone: '+91 9065912445',
        role: 'user'
      });
      console.log('Seeded demo user (wanderer / password123) successfully.');
    }

    // Refresh catalog collections with up-to-date realistic INR rates
    await Flight.deleteMany({});
    await Flight.insertMany(seedFlights);
    console.log('Seeded Flights successfully.');

    await Train.deleteMany({});
    const insertedTrains = await Train.insertMany(seedTrains);
    console.log('Seeded Trains successfully.');

    await Bus.deleteMany({});
    await Bus.insertMany(seedBuses);
    console.log('Seeded Buses successfully.');

    await Hotel.deleteMany({});
    await Hotel.insertMany(seedHotels);
    console.log('Seeded Hotels successfully.');

    // Seed initial demo package booking if none exist
    const pkgBookingCount = await PackageBooking.countDocuments();
    if (pkgBookingCount === 0) {
      const demoPkg = await PackageBooking.create({
        bookingId: 'TF-PKG-104928',
        referenceNumber: 'PKG829104',
        userId: demoUser._id,
        packageTitle: 'Maldives Luxury Lagoon & Water Villa',
        destination: 'Maldives',
        duration: '5 Days / 4 Nights',
        travelDate: new Date(Date.now() + 86400000 * 14),
        paxCount: 2,
        pricePerPerson: 89500,
        passengers: [
          { fullName: 'Alex Explorer', age: 29, gender: 'Male' },
          { fullName: 'Sam Rivera', age: 28, gender: 'Female' }
        ],
        primaryContact: {
          fullName: 'Alex Explorer',
          email: 'wanderer@tourfever.com',
          phone: '+91 9065912445'
        },
        baseFare: 179000,
        taxes: 17900,
        totalAmount: 196900,
        status: 'CONFIRMED',
        paymentId: 'TXN-90281942',
        paymentStatus: 'PAID',
        paymentMethod: 'CARD',
        cardLast4: '4242'
      });

      await Payment.create({
        transactionId: demoPkg.paymentId,
        bookingType: 'PACKAGE',
        bookingId: demoPkg.bookingId,
        userId: demoUser._id,
        amount: demoPkg.totalAmount,
        currency: 'INR',
        paymentMethod: 'CARD',
        cardHolder: 'ALEX EXPLORER',
        cardLast4: '4242',
        status: 'SUCCESS',
        paymentGateway: 'Tour Fever SecurePay'
      });
      console.log('Seeded verified holiday package booking successfully.');
    }

    // Seed initial demo train ticket if none exist
    const trainBookingCount = await TrainBooking.countDocuments();
    if (trainBookingCount === 0 && insertedTrains.length > 1) {
      const sampleTrain = insertedTrains[1]; // Mumbai Rajdhani
      const demoTrainBooking = await TrainBooking.create({
        bookingId: 'TF-TRN-749103',
        pnr: '2849103948',
        userId: demoUser._id,
        trainId: sampleTrain._id,
        trainSnapshot: {
          trainNumber: sampleTrain.trainNumber,
          trainName: sampleTrain.trainName,
          fromStation: sampleTrain.fromStation,
          fromCode: sampleTrain.fromCode,
          toStation: sampleTrain.toStation,
          toCode: sampleTrain.toCode,
          fromCity: sampleTrain.fromCity,
          toCity: sampleTrain.toCity,
          departureTime: sampleTrain.departureTime,
          arrivalTime: sampleTrain.arrivalTime,
          duration: sampleTrain.duration
        },
        journeyDate: new Date(Date.now() + 86400000 * 5),
        selectedClass: '3A',
        quota: 'General',
        passengers: [
          {
            fullName: 'Alex Explorer',
            age: 29,
            gender: 'Male',
            berthPreference: 'Lower Berth',
            allocatedCoach: 'B1',
            allocatedBerth: '23 (Lower)'
          }
        ],
        contactDetails: {
          name: 'Alex Explorer',
          email: 'wanderer@tourfever.com',
          phone: '+91 9065912445'
        },
        farePerPassenger: 1850,
        cateringFee: 0,
        totalAmount: 1850,
        status: 'CONFIRMED',
        paymentId: 'TXN-83910284',
        paymentStatus: 'PAID'
      });

      await Payment.create({
        transactionId: demoTrainBooking.paymentId,
        bookingType: 'TRAIN',
        bookingId: demoTrainBooking.bookingId,
        userId: demoUser._id,
        amount: demoTrainBooking.totalAmount,
        currency: 'INR',
        paymentMethod: 'UPI',
        cardHolder: 'ALEX EXPLORER',
        cardLast4: 'UPI',
        status: 'SUCCESS',
        paymentGateway: 'Tour Fever SecurePay'
      });
      console.log('Seeded verified express train booking successfully.');
    }

    // Seed initial demo concierge inquiry if none exist
    const inqCount = await Inquiry.countDocuments();
    if (inqCount === 0) {
      await Inquiry.create({
        destination: 'Swiss Alps & Glacier Express Tour',
        people: 2,
        checkin: new Date(Date.now() + 86400000 * 20).toISOString().split('T')[0],
        checkout: new Date(Date.now() + 86400000 * 27).toISOString().split('T')[0],
        userName: 'Alex Explorer',
        userEmail: 'wanderer@tourfever.com',
        phone: '+91 9065912445',
        userId: demoUser._id,
        status: 'Under Review'
      });
      console.log('Seeded verified concierge travel inquiry successfully.');
    }

    // Seed active Promo Codes / Coupons
    const Coupon = require('./models/Coupon');
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.create([
        {
          code: 'WELCOME500',
          title: 'First-Time Explorer Discount',
          description: 'Get an instant flat ₹500 off on holiday bookings above ₹5,000.',
          discountType: 'FLAT',
          discountValue: 500,
          minBookingAmount: 5000,
          maxDiscountAmount: 500,
          validUntil: new Date('2027-12-31T23:59:59Z'),
          isActive: true
        },
        {
          code: 'EXPLORE10',
          title: '10% Off Vacation Packages',
          description: 'Save 10% (up to ₹2,500) on curated tour reservations above ₹20,000.',
          discountType: 'PERCENT',
          discountValue: 10,
          minBookingAmount: 20000,
          maxDiscountAmount: 2500,
          validUntil: new Date('2027-12-31T23:59:59Z'),
          isActive: true
        },
        {
          code: 'TOURFEVER15',
          title: '15% Grand Celebration Bonanza',
          description: 'Save 15% (up to ₹5,000) on premium international vacation packages above ₹50,000.',
          discountType: 'PERCENT',
          discountValue: 15,
          minBookingAmount: 50000,
          maxDiscountAmount: 5000,
          validUntil: new Date('2027-12-31T23:59:59Z'),
          isActive: true
        }
      ]);
      console.log('Seeded verified active coupons successfully.');
    }

    // Seed initial Traveler Reviews
    const Review = require('./models/Review');
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0 && demoUser) {
      await Review.create([
        {
          userId: demoUser._id,
          userName: 'Alex Explorer',
          packageId: 'pkg-1',
          packageTitle: 'Maldives Luxury Lagoon & Water Villa',
          rating: 5,
          comment: 'The overwater villa was beyond magical! Crystal clear lagoon right below the deck, pristine coral reef snorkeling, and top-tier hospitality.',
          isVerifiedTraveler: true,
          travelDate: 'October 2026'
        },
        {
          userId: demoUser._id,
          userName: 'Priya Sharma',
          packageId: 'pkg-2',
          packageTitle: 'Swiss Alps & Glacier Express Grand Tour',
          rating: 5,
          comment: 'The panoramic Glacier Express train through the snow-capped Swiss mountains was a once-in-a-lifetime experience. Everything was coordinated smoothly.',
          isVerifiedTraveler: true,
          travelDate: 'September 2026'
        },
        {
          userId: demoUser._id,
          userName: 'Rohan Mehta',
          packageId: 'pkg-3',
          packageTitle: 'Kyoto Zen Temples & Heritage Discovery',
          rating: 5,
          comment: 'Staying at the traditional Ryokan and walking through the Arashiyama bamboo grove at sunrise was peaceful and unforgettable.',
          isVerifiedTraveler: true,
          travelDate: 'August 2026'
        },
        {
          userId: demoUser._id,
          userName: 'Samantha Lee',
          packageId: 'pkg-4',
          packageTitle: 'Dubai Marina Luxury & Desert Glamping',
          rating: 4,
          comment: 'Incredible desert sunset safari and VIP yacht cruise. 5-star marina hotel was magnificent.',
          isVerifiedTraveler: true,
          travelDate: 'July 2026'
        }
      ]);
      console.log('Seeded verified traveler reviews successfully.');
    }
  } catch (err) {
    console.error('Error during auto-seeding:', err.message);
  }
}

module.exports = { seedDatabase, seedFlights, seedTrains, seedBuses, seedHotels };
