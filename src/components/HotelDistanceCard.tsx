import React from 'react';

// Haversine formula to calculate distance in km between two lat/lng points
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const cityCenter = { name: "Las Vegas Strip", lat: 36.1147, lng: -115.1728 };
const attractions = [
  { name: "Bellagio Fountains", lat: 36.1126, lng: -115.1767 },
  { name: "The Venetian", lat: 36.1216, lng: -115.1690 },
  { name: "High Roller", lat: 36.1186, lng: -115.1686 }
];

const hotels = [
  {
    hotelName: "Bellagio",
    address: { line1: "3600 Las Vegas Blvd S, Las Vegas" },
    lat: 36.1126,
    lng: -115.1767
  },
  {
    hotelName: "The Venetian",
    address: { line1: "3355 S Las Vegas Blvd, Las Vegas" },
    lat: 36.1216,
    lng: -115.1690
  },
  {
    hotelName: "MGM Grand",
    address: { line1: "3799 S Las Vegas Blvd, Las Vegas" },
    lat: 36.1024,
    lng: -115.1697
  }
];

export const HotelDistanceCard: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {hotels.map(hotel => {
        // Calculate distances
        const distToCenter = getDistanceKm(hotel.lat, hotel.lng, cityCenter.lat, cityCenter.lng);
        const distToAttractions = attractions.map(attraction => ({
          ...attraction,
          distance: getDistanceKm(hotel.lat, hotel.lng, attraction.lat, attraction.lng)
        }));
        const closestAttraction = distToAttractions.reduce((a, b) => a.distance < b.distance ? a : b);
        return (
          <div
            key={hotel.hotelName}
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 16,
              padding: 24,
              maxWidth: 420,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              background: '#fff',
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 700 }}>{hotel.hotelName}</h3>
            <p style={{ color: "#555", marginBottom: 8 }}>{hotel.address.line1}</p>
            <div style={{ margin: "8px 0 12px 0" }}>
              <span role="img" aria-label="city center">📍</span>
              <span style={{ marginLeft: 4 }}>{distToCenter.toFixed(2)} km from {cityCenter.name}</span>
              <br />
              <span role="img" aria-label="attraction">🏛️</span>
              <span style={{ marginLeft: 4 }}>{closestAttraction.distance.toFixed(2)} km from {closestAttraction.name}</span>
            </div>
            {/* ...other hotel info/buttons... */}
            <button style={{
              marginTop: 12,
              padding: '8px 20px',
              background: '#0071bc',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
            }}>Book Now</button>
          </div>
        );
      })}
    </div>
  );
}; 