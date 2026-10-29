import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker assets in bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function HotelMap({
  hotels = [],
  selectedHotelId = null,
  onSelectHotel,
  center = [10.0, 76.5],
  zoom = 8,
  height = '100%',
  singleHotelMode = false
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map instance
    if (!mapInstanceRef.current) {
      const initialCenter = singleHotelMode && hotels.length > 0 && hotels[0].latitude
        ? [hotels[0].latitude, hotels[0].longitude]
        : center;

      const initialZoom = singleHotelMode ? 13 : zoom;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: true,
        scrollWheelZoom: !singleHotelMode ? true : false,
      });

      // Standard OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    const bounds = L.latLngBounds();
    let hasValidCoords = false;

    hotels.forEach((hotel) => {
      const lat = Number(hotel.latitude);
      const lng = Number(hotel.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      hasValidCoords = true;
      bounds.extend([lat, lng]);

      const isSelected = selectedHotelId === hotel.id;

      // Custom HTML Pin Marker
      let icon;
      if (singleHotelMode) {
        icon = L.divIcon({
          className: 'custom-hotel-pin',
          html: `
            <div style="background-color: #059669; width: 44px; height: 44px; border-radius: 50%; border: 3px solid white; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 20px;">
              🏨
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22]
        });
      } else {
        const formattedPrice = Number(hotel.min_price || 2500).toLocaleString('en-IN');
        icon = L.divIcon({
          className: 'custom-price-pin',
          html: `
            <div style="
              background-color: ${isSelected ? '#059669' : '#ffffff'};
              color: ${isSelected ? '#ffffff' : '#0f172a'};
              border: 1.5px solid ${isSelected ? '#059669' : '#cbd5e1'};
              padding: 4px 10px;
              border-radius: 9999px;
              font-weight: 700;
              font-size: 11px;
              white-space: nowrap;
              box-shadow: 0 4px 6px -1px rgba(0,0,0,0.15);
              cursor: pointer;
              transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
              transition: transform 0.15s ease-in-out;
            ">
              ₹${formattedPrice}
            </div>
          `,
          iconSize: [68, 28],
          iconAnchor: [34, 14]
        });
      }

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      markersRef.current[hotel.id] = marker;

      // Interactive Popup Card
      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '210px';
      popupContent.style.fontFamily = 'inherit';
      popupContent.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <img src="${hotel.image_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'}" 
               alt="${hotel.name}" 
               style="width: 100%; height: 110px; object-fit: cover; border-radius: 8px;" />
          <div style="padding: 2px 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-size: 11px; font-weight: 600; color: #059669;">${hotel.place_name || 'Kerala'}</span>
              <span style="font-size: 11px; font-weight: 700; color: #d97706;">★ ${hotel.average_rating || hotel.star_rating || 4.5}</span>
            </div>
            <h4 style="font-size: 13px; font-weight: 700; margin: 0 0 4px; color: #0f172a; line-height: 1.2;">
              ${hotel.name}
            </h4>
            <p style="font-size: 11px; color: #64748b; margin: 0 0 6px;">
              ${hotel.address ? hotel.address.substring(0, 40) + '...' : ''}
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #f1f5f9; padding-top: 6px;">
              <span style="font-size: 12px; font-weight: 800; color: #0f172a;">
                ₹${Number(hotel.min_price || 2500).toLocaleString('en-IN')}<span style="font-size: 10px; font-weight: 400; color: #64748b;"> / night</span>
              </span>
              <button id="view-hotel-${hotel.id}" style="background-color: #059669; color: white; border: none; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer;">
                View
              </button>
            </div>
          </div>
        </div>
      `;

      // Attach button listener
      const viewBtn = popupContent.querySelector(`#view-hotel-${hotel.id}`);
      if (viewBtn) {
        viewBtn.onclick = () => {
          navigate(`/hotel/${hotel.id}`);
        };
      }

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectHotel) onSelectHotel(hotel);
      });
    });

    // Auto-fit bounds if multiple hotels
    if (!singleHotelMode && hasValidCoords && hotels.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (singleHotelMode && hotels.length === 1 && hotels[0].latitude) {
      map.setView([hotels[0].latitude, hotels[0].longitude], 14);
    }
  }, [hotels, selectedHotelId, onSelectHotel, center, zoom, singleHotelMode, navigate]);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl shadow-inner border border-slate-200 dark:border-slate-800" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
}
