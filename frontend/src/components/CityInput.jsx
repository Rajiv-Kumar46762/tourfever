import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Plane, Train, Bus, Hotel } from 'lucide-react';

export const RAILWAY_STATIONS = [
  { name: 'New Delhi', code: 'NDLS', zone: 'Northern Railway', state: 'Delhi' },
  { name: 'Mumbai Central', code: 'MMCT', zone: 'Western Railway', state: 'Maharashtra' },
  { name: 'CSMT Mumbai', code: 'CSMT', zone: 'Central Railway', state: 'Maharashtra' },
  { name: 'KSR Bengaluru', code: 'SBC', zone: 'South Western Railway', state: 'Karnataka' },
  { name: 'Chennai Central', code: 'MAS', zone: 'Southern Railway', state: 'Tamil Nadu' },
  { name: 'Howrah Jn', code: 'HWH', zone: 'Eastern Railway', state: 'West Bengal' },
  { name: 'Varanasi Jn', code: 'BSB', zone: 'Northern Railway', state: 'Uttar Pradesh' },
  { name: 'Madgaon Jn (Goa)', code: 'MAO', zone: 'Konkan Railway', state: 'Goa' },
  { name: 'Jaipur Jn', code: 'JP', zone: 'North Western Railway', state: 'Rajasthan' },
  { name: 'Agra Cantt', code: 'AGC', zone: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Pune Jn', code: 'PUNE', zone: 'Central Railway', state: 'Maharashtra' },
  { name: 'Ahmedabad Jn', code: 'ADI', zone: 'Western Railway', state: 'Gujarat' },
  { name: 'Secunderabad Jn', code: 'SC', zone: 'South Central Railway', state: 'Telangana' },
  { name: 'Hyderabad Deccan', code: 'HYB', zone: 'South Central Railway', state: 'Telangana' },
  { name: 'Lucknow Charbagh', code: 'LKO', zone: 'Northern Railway', state: 'Uttar Pradesh' },
  { name: 'Patna Jn', code: 'PNBE', zone: 'East Central Railway', state: 'Bihar' },
  { name: 'Chandigarh Jn', code: 'CDG', zone: 'Northern Railway', state: 'Punjab' },
  { name: 'Amritsar Jn', code: 'ASR', zone: 'Northern Railway', state: 'Punjab' },
  { name: 'Bhopal Jn', code: 'BPL', zone: 'West Central Railway', state: 'Madhya Pradesh' },
  { name: 'Kanpur Central', code: 'CNB', zone: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Gorakhpur Jn', code: 'GKP', zone: 'North Eastern Railway', state: 'Uttar Pradesh' },
  { name: 'Surat', code: 'ST', zone: 'Western Railway', state: 'Gujarat' },
  { name: 'Bhubaneswar', code: 'BBS', zone: 'East Coast Railway', state: 'Odisha' },
  { name: 'Guwahati', code: 'GHY', zone: 'Northeast Frontier Railway', state: 'Assam' },
  { name: 'Haridwar', code: 'HW', zone: 'Northern Railway', state: 'Uttarakhand' },
  { name: 'Dehradun', code: 'DDN', zone: 'Northern Railway', state: 'Uttarakhand' },
  { name: 'Puri', code: 'PURI', zone: 'East Coast Railway', state: 'Odisha' },
  { name: 'Prayagraj Jn', code: 'PRYJ', zone: 'North Central Railway', state: 'Uttar Pradesh' },
  { name: 'Jammu Tawi', code: 'JAT', zone: 'Northern Railway', state: 'Jammu & Kashmir' },
  { name: 'Visakhapatnam', code: 'VSKP', zone: 'East Coast Railway', state: 'Andhra Pradesh' },
  { name: 'Thiruvananthapuram Central', code: 'TVC', zone: 'Southern Railway', state: 'Kerala' }
];

export const POPULAR_AIRPORTS = [
  { name: 'Delhi', code: 'DEL', airport: 'Indira Gandhi Intl (DEL)', state: 'Delhi, India' },
  { name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Intl (BOM)', state: 'Maharashtra, India' },
  { name: 'Bangalore', code: 'BLR', airport: 'Kempegowda Intl (BLR)', state: 'Karnataka, India' },
  { name: 'Goa (MOPA)', code: 'GOX', airport: 'Manohar Intl Airport (GOX)', state: 'Goa, India' },
  { name: 'Jaipur', code: 'JAI', airport: 'Jaipur International (JAI)', state: 'Rajasthan, India' },
  { name: 'Kolkata', code: 'CCU', airport: 'Netaji Subhash Chandra (CCU)', state: 'West Bengal, India' },
  { name: 'Chennai', code: 'MAA', airport: 'Chennai International (MAA)', state: 'Tamil Nadu, India' },
  { name: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi Intl (HYD)', state: 'Telangana, India' },
  { name: 'Ahmedabad', code: 'AMD', airport: 'Sardar Vallabhbhai (AMD)', state: 'Gujarat, India' },
  { name: 'Dubai', code: 'DXB', airport: 'Dubai International (DXB)', state: 'UAE' },
  { name: 'Singapore', code: 'SIN', airport: 'Singapore Changi (SIN)', state: 'Singapore' },
  { name: 'Maldives', code: 'MLE', airport: 'Velana International (MLE)', state: 'Maldives' },
  { name: 'London', code: 'LHR', airport: 'London Heathrow (LHR)', state: 'United Kingdom' },
  { name: 'Paris', code: 'CDG', airport: 'Charles de Gaulle (CDG)', state: 'France' },
  { name: 'Tokyo', code: 'HND', airport: 'Tokyo Haneda (HND)', state: 'Japan' },
  { name: 'Swiss Alps (Zurich)', code: 'ZRH', airport: 'Zurich International (ZRH)', state: 'Switzerland' }
];

export const POPULAR_CITIES = [
  { name: 'Delhi', code: 'DEL', state: 'Delhi, India' },
  { name: 'Mumbai', code: 'BOM', state: 'Maharashtra, India' },
  { name: 'Bangalore', code: 'BLR', state: 'Karnataka, India' },
  { name: 'Goa', code: 'GOA', state: 'Goa, India' },
  { name: 'Manali', code: 'MNL', state: 'Himachal Pradesh, India' },
  { name: 'Jaipur', code: 'JPR', state: 'Rajasthan, India' },
  { name: 'Shimla', code: 'SML', state: 'Himachal Pradesh, India' },
  { name: 'Varanasi', code: 'VNS', state: 'Uttar Pradesh, India' },
  { name: 'Dubai', code: 'DXB', state: 'United Arab Emirates' },
  { name: 'Maldives', code: 'MLD', state: 'Maldives' },
  { name: 'Kyoto', code: 'KYO', state: 'Japan' },
  { name: 'Swiss Alps', code: 'SWI', state: 'Switzerland' }
];

export default function CityInput({
  value,
  onChange,
  mode = 'city', // 'train' | 'flight' | 'city'
  placeholder,
  icon: CustomIcon,
  className = '',
  required = false,
  name = 'city',
  id
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const wrapperRef = useRef(null);

  // Pick dataset based on mode
  const dataList = mode === 'train' ? RAILWAY_STATIONS : mode === 'flight' ? POPULAR_AIRPORTS : POPULAR_CITIES;

  // Choose default icon
  const IconComponent = CustomIcon || (mode === 'train' ? Train : mode === 'flight' ? Plane : MapPin);

  // Default placeholder
  const defaultPlaceholder = placeholder || (
    mode === 'train' ? 'e.g. New Delhi (NDLS)' :
    mode === 'flight' ? 'e.g. Delhi (DEL)' :
    'Type city or destination...'
  );

  useEffect(() => {
    if (!value || value.trim() === '') {
      setFilteredItems(dataList.slice(0, 8));
    } else {
      const q = value.toLowerCase().trim();
      const matches = dataList.filter((item) =>
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        (item.state && item.state.toLowerCase().includes(q)) ||
        (item.airport && item.airport.toLowerCase().includes(q)) ||
        (item.zone && item.zone.toLowerCase().includes(q))
      );
      setFilteredItems(matches);
    }
  }, [value, mode]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectItem = (item) => {
    if (mode === 'train') {
      onChange(`${item.name} (${item.code})`);
    } else if (mode === 'flight') {
      onChange(`${item.name} (${item.code})`);
    } else {
      onChange(item.name);
    }
    setIsOpen(false);
  };

  return (
    <div className={`city-autocomplete-wrapper ${className}`} ref={wrapperRef}>
      <div className="city-input-field-box">
        {IconComponent && <IconComponent size={18} className="city-field-icon" />}
        <input
          type="text"
          name={name}
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={defaultPlaceholder}
          required={required}
          autoComplete="off"
          className="city-text-input"
          style={{ paddingLeft: '44px' }}
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <ul className="city-suggestions-dropdown animate-fade-in" role="listbox">
          <li className="dropdown-header-tag">
            {mode === 'train' ? '🚂 POPULAR RAILWAY STATIONS (IRCTC CODES)' :
             mode === 'flight' ? '✈️ POPULAR AIRPORTS (IATA CODES)' :
             '📍 POPULAR DESTINATIONS'}
          </li>
          {filteredItems.map((item) => (
            <li
              key={item.name + item.code}
              className="city-suggestion-item"
              onClick={() => handleSelectItem(item)}
            >
              <div className="city-item-left">
                {mode === 'train' ? (
                  <Train size={16} className="text-highlight item-icon" />
                ) : mode === 'flight' ? (
                  <Plane size={16} className="text-highlight item-icon" />
                ) : (
                  <MapPin size={16} className="text-highlight item-icon" />
                )}
                <div className="city-item-details">
                  <div className="city-name-row">
                    <strong className="city-title">{item.name}</strong>
                    <span className={`city-code-tag ${mode === 'train' ? 'train-code-badge' : ''}`}>
                      {item.code}
                    </span>
                  </div>
                  <span className="city-subtext">
                    {mode === 'train' ? `${item.zone} • ${item.state}` :
                     mode === 'flight' ? `${item.airport} • ${item.state}` :
                     item.state}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
