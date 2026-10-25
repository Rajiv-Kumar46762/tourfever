const Hotel = require('../models/Hotel');
const HotelBooking = require('../models/HotelBooking');
const Payment = require('../models/Payment');

function generateHotelBookingId() {
  return 'TF-HT-' + Date.now().toString().slice(-6) + Math.floor(100 + Math.random() * 900);
}

function generateConfirmationCode() {
  return 'HTL' + Math.floor(100000 + Math.random() * 900000);
}

async function generateLiveHotels(cityStr) {
  if (!cityStr) return [];
  const cleanCity = cityStr.charAt(0).toUpperCase() + cityStr.slice(1).trim();

  const hotelTemplates = [
    {
      name: `The Grand ${cleanCity} Palace & Resort`,
      address: `101 Royal Boulevard, Central ${cleanCity}`,
      location: `City Center, ${cleanCity}`,
      starRating: 5,
      userRating: 4.9,
      reviewsCount: 780,
      image: '/images/popular-1.jpg',
      startingPrice: 3800,
      description: `Experience premier luxury in the heart of ${cleanCity} with panoramic views, temperature-controlled infinity pool, bespoke wellness spa, and award-winning fine dining.`,
      amenities: ['Infinity Pool', 'Luxury Spa', 'Free High-Speed WiFi', 'Airport Shuttle', 'Fine Dining', '24/7 Room Service']
    },
    {
      name: `${cleanCity} Heritage Haveli & Luxury Suites`,
      address: `Heritage District, Old ${cleanCity}`,
      location: `Historic Quarter, ${cleanCity}`,
      starRating: 5,
      userRating: 4.8,
      reviewsCount: 520,
      image: '/images/packege-3.jpg',
      startingPrice: 2950,
      description: `Immerse in the historic charm and royal hospitality of ${cleanCity} with handcrafted courtyards, traditional folk music evenings, and authentic regional gastronomy.`,
      amenities: ['Heritage Courtyard', 'Ayurvedic Spa', 'Free Breakfast', 'Free WiFi', 'Cultural Evenings']
    },
    {
      name: `Radisson Blu Hotel & Suites, ${cleanCity}`,
      address: `Ring Road, Airport Enclave, ${cleanCity}`,
      location: `Airport Enclave, ${cleanCity}`,
      starRating: 5,
      userRating: 4.8,
      reviewsCount: 640,
      image: '/images/popular-2.jpg',
      startingPrice: 4200,
      description: `Contemporary 5-star haven featuring plush soundproof suites, 24-hour fitness center, rooftop skyline lounge, and rapid airport transfers in ${cleanCity}.`,
      amenities: ['Rooftop Pool', 'Airport Chauffeur', 'Fitness Center', 'Executive Lounge', 'Free WiFi']
    },
    {
      name: `Royal Orchid Boutique Hotel, ${cleanCity}`,
      address: `Lakeside Promenade, ${cleanCity}`,
      location: `Lakeside, ${cleanCity}`,
      starRating: 4,
      userRating: 4.7,
      reviewsCount: 390,
      image: '/images/popular-3.jpg',
      startingPrice: 2200,
      description: `Charming boutique retreat offering tranquil lake views, lush landscaped gardens, artisanal cafe, and prompt concierge service in ${cleanCity}.`,
      amenities: ['Garden View', 'Complimentary Breakfast', 'Free WiFi', 'Coffee Lounge', 'Valet Parking']
    }
  ];

  const created = [];
  for (const h of hotelTemplates) {
    const hotelDoc = new Hotel({
      name: h.name,
      city: cleanCity,
      address: h.address,
      location: h.location,
      starRating: h.starRating,
      userRating: h.userRating,
      reviewsCount: h.reviewsCount,
      image: h.image,
      gallery: [h.image],
      description: h.description,
      amenities: h.amenities,
      startingPrice: h.startingPrice,
      rooms: [
        {
          roomId: `R1-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          roomType: 'Deluxe City View Room',
          pricePerNight: h.startingPrice,
          maxGuests: 2,
          bedType: '1 King Bed',
          size: '340 sq.ft',
          amenities: ['City View', 'Air Conditioning', 'Free WiFi', 'Tea/Coffee Maker'],
          availableCount: 8
        },
        {
          roomId: `R2-${Date.now()}-${Math.floor(Math.random() * 100)}`,
          roomType: 'Executive Suite with Lounge Access',
          pricePerNight: Math.round(h.startingPrice * 1.65),
          maxGuests: 3,
          bedType: '1 King Bed + 1 Sofa Bed',
          size: '520 sq.ft',
          amenities: ['Living Room', 'Lounge Access', 'Bathtub', 'High-Speed WiFi'],
          availableCount: 4
        }
      ],
      isActive: true
    });
    created.push(hotelDoc);
  }

  try {
    return await Hotel.insertMany(created);
  } catch (err) {
    return created;
  }
}

exports.searchHotels = async (req, res) => {
  try {
    const { city, checkin, checkout, guests, rooms, starRating, minPrice, maxPrice } = req.query;
    const query = { isActive: true };

    if (city) {
      query.$or = [
        { city: new RegExp(city, 'i') },
        { location: new RegExp(city, 'i') },
        { name: new RegExp(city, 'i') }
      ];
    }

    if (starRating) {
      query.starRating = { $gte: Number(starRating) };
    }

    if (minPrice || maxPrice) {
      query.startingPrice = {};
      if (minPrice) query.startingPrice.$gte = Number(minPrice);
      if (maxPrice) query.startingPrice.$lte = Number(maxPrice);
    }

    let hotels = await Hotel.find(query);

    // If query has specific city and no hotels found in DB, generate real-time live hotels for that city!
    if (hotels.length === 0 && city) {
      hotels = await generateLiveHotels(city);
    } else if (hotels.length === 0) {
      hotels = await Hotel.find({ isActive: true });
    }

    res.json({ success: true, count: hotels.length, data: hotels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDestinations = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isActive: true });
    const dests = new Set();
    hotels.forEach(h => dests.add(h.city));
    res.json({ success: true, data: Array.from(dests) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.json({ success: true, data: hotel });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.bookHotel = async (req, res) => {
  try {
    const {
      hotelId,
      roomId,
      checkInDate,
      checkOutDate,
      roomsCount,
      guestsCount,
      guests,
      primaryContact,
      paymentMethod,
      cardLast4,
      cardHolder
    } = req.body;

    if (!hotelId || !checkInDate || !checkOutDate || !primaryContact) {
      return res.status(400).json({ success: false, message: 'Missing required hotel booking details.' });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found.' });
    }

    const room = hotel.rooms.find(r => r.roomId === roomId) || hotel.rooms[0];
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const numRooms = Number(roomsCount) || 1;
    const numGuests = Number(guestsCount) || 1;

    const baseAmount = room.pricePerNight * nights * numRooms;
    const taxes = Math.round(baseAmount * 0.12);
    const totalAmount = baseAmount + taxes;

    const bookingId = generateHotelBookingId();
    const confirmationCode = generateConfirmationCode();

    const booking = new HotelBooking({
      bookingId,
      confirmationCode,
      userId: req.user ? req.user.userId : null,
      hotelId: hotel._id,
      hotelSnapshot: {
        name: hotel.name,
        city: hotel.city,
        address: hotel.address,
        location: hotel.location,
        starRating: hotel.starRating,
        image: hotel.image
      },
      roomType: room.roomType,
      pricePerNight: room.pricePerNight,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nights,
      roomsCount: numRooms,
      guestsCount: numGuests,
      guests: guests && guests.length > 0 ? guests : [{ fullName: primaryContact.fullName, age: 30 }],
      primaryContact,
      taxes,
      totalAmount,
      status: 'CONFIRMED',
      paymentId: 'TXN-' + Math.floor(10000000 + Math.random() * 90000000),
      paymentStatus: 'PAID'
    });

    await booking.save();

    // Create Payment Record
    const payment = new Payment({
      transactionId: booking.paymentId,
      bookingType: 'HOTEL',
      bookingId: booking.bookingId,
      userId: req.user ? req.user.userId : null,
      amount: totalAmount,
      currency: 'INR',
      paymentMethod: paymentMethod || 'CARD',
      cardHolder: cardHolder || primaryContact.fullName || 'VALUED TRAVELER',
      cardLast4: cardLast4 || '4242',
      status: 'SUCCESS'
    });
    await payment.save();

    res.status(201).json({
      success: true,
      message: 'Hotel room booked successfully!',
      data: booking
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHotelBookingById = async (req, res) => {
  try {
    const booking = await HotelBooking.findOne({ bookingId: req.params.bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }
    res.json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.cancelHotelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;
    const booking = await HotelBooking.findOne({ bookingId });
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    booking.status = 'CANCELLED';
    booking.paymentStatus = 'REFUNDED';
    booking.cancellationReason = reason || 'Customer requested cancellation';
    booking.cancelledAt = new Date();
    await booking.save();

    await Payment.findOneAndUpdate(
      { bookingId: booking.bookingId },
      { status: 'REFUNDED' }
    );

    res.json({ success: true, message: 'Hotel booking cancelled and refund initiated.', data: booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
