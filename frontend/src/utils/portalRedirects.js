import { RAILWAY_STATIONS, POPULAR_AIRPORTS, POPULAR_CITIES } from '../components/CityInput';

/**
 * Extracts a clean 2-5 letter Railway Station Code (e.g. "NDLS", "MMCT", "BSB")
 */
export const getStationCode = (input, fallback = 'NDLS') => {
  if (!input || typeof input !== 'string') return fallback;
  // 1. Check if in parentheses e.g. "New Delhi (NDLS)" -> "NDLS"
  const parenMatch = input.match(/\(([A-Za-z0-9]+)\)/);
  if (parenMatch) return parenMatch[1].toUpperCase();

  // 2. Check if whole string is an exact station code
  const trimmed = input.trim().toUpperCase();
  if (/^[A-Z]{2,5}$/.test(trimmed)) return trimmed;

  // 3. Match against RAILWAY_STATIONS catalog
  const found = RAILWAY_STATIONS.find(
    (s) =>
      s.name.toLowerCase() === input.toLowerCase().trim() ||
      input.toLowerCase().includes(s.name.toLowerCase()) ||
      s.code.toLowerCase() === input.toLowerCase().trim()
  );
  if (found) return found.code;

  const sanitized = trimmed.replace(/[^A-Z]/g, '');
  return sanitized.length >= 2 ? sanitized.slice(0, 5) : fallback;
};

/**
 * Extracts a clean 3-letter IATA Airport Code (e.g. "DEL", "BOM", "DXB")
 */
export const getAirportCode = (input, fallback = 'DEL') => {
  if (!input || typeof input !== 'string') return fallback;
  // 1. Check if in parentheses e.g. "Delhi (DEL)" -> "DEL"
  const parenMatch = input.match(/\(([A-Za-z]{3})\)/);
  if (parenMatch) return parenMatch[1].toUpperCase();

  // 2. Check if whole string is 3-letter IATA code
  const trimmed = input.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(trimmed)) return trimmed;

  // 3. Match against POPULAR_AIRPORTS catalog
  const found = POPULAR_AIRPORTS.find(
    (a) =>
      a.name.toLowerCase() === input.toLowerCase().trim() ||
      input.toLowerCase().includes(a.name.toLowerCase()) ||
      a.code.toLowerCase() === input.toLowerCase().trim()
  );
  if (found) return found.code;

  const sanitized = trimmed.replace(/[^A-Z]/g, '');
  return sanitized.length >= 3 ? sanitized.slice(0, 3) : fallback;
};

/**
 * Strips any code parentheses and returns clean city name (e.g. "Goa (GOX)" -> "Goa")
 */
export const getCleanCity = (input, fallback = 'Goa') => {
  if (!input || typeof input !== 'string') return fallback;
  const stripped = input.replace(/\s*\(.*?\)\s*/g, '').trim();
  return stripped || fallback;
};

/**
 * Builds prefilled Google Flights URL using IATA airport codes
 */
export const buildGoogleFlightsUrl = (fromInput, toInput, date) => {
  const fromCode = getAirportCode(fromInput, 'DEL');
  const toCode = getAirportCode(toInput, 'BOM');
  
  let q = `flights from ${fromCode} to ${toCode}`;
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    q += ` on ${date}`;
  }
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&curr=INR`;
};

/**
 * Returns official IRCTC train eTicketing portal URL (https://www.irctc.co.in/nget/train-search)
 */
export const buildTrainPortalUrl = () => {
  return 'https://www.irctc.co.in/nget/train-search';
};

/**
 * Returns official IRCTC portal URL
 */
export const getOfficialIRCTCUrl = () => {
  return 'https://www.irctc.co.in/nget/train-search';
};

/**
 * Builds prefilled Booking.com search results URL with destination, dates, guests, and currency
 */
export const buildBookingComUrl = (cityInput, checkin, checkout, guests = 2) => {
  const cleanCity = getCleanCity(cityInput, 'Goa');
  const params = new URLSearchParams();
  params.set('ss', cleanCity);
  if (checkin && /^\d{4}-\d{2}-\d{2}$/.test(checkin)) {
    params.set('checkin', checkin);
  }
  if (checkout && /^\d{4}-\d{2}-\d{2}$/.test(checkout)) {
    params.set('checkout', checkout);
  }
  params.set('group_adults', String(guests || 2));
  params.set('no_rooms', '1');
  params.set('group_children', '0');
  params.set('selected_currency', 'INR');
  return `https://www.booking.com/searchresults.html?${params.toString()}`;
};

/**
 * Builds prefilled RedBus URL with clean origin and destination city slugs
 */
export const buildRedBusUrl = (fromInput, toInput) => {
  const fromCity = getCleanCity(fromInput, 'Bangalore').toLowerCase().replace(/\s+/g, '-');
  const toCity = getCleanCity(toInput, 'Goa').toLowerCase().replace(/\s+/g, '-');
  return `https://www.redbus.in/bus-tickets/${encodeURIComponent(fromCity)}-to-${encodeURIComponent(toCity)}`;
};
