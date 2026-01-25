// @ts-nocheck
'use client'

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { MapPin, Navigation, Info, Route, Clock, Car } from 'lucide-react';
import { Language } from '../../types';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapComponentProps {
  lang: Language;
}

interface Office {
  id: number;
  name: string;
  nameBn: string;
  lat: number;
  lng: number;
  address: string;
  addressBn: string;
  type: 'office' | 'institute' | 'center' | 'university';
  phone?: string;
  distance?: number;
}

const agriculturalOffices: Office[] = [
  {
    id: 1,
    name: 'Dhaka Agriculture Office',
    nameBn: 'ঢাকা কৃষি অফিস',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Krishi Khamar Sarak, Dhaka',
    addressBn: 'কৃষি ভবন সড়ক, ঢাকা',
    type: 'office',
    phone: '+880-2-9111234'
  },
  {
    id: 2,
    name: 'Bangladesh Agricultural Research Institute (BARI)',
    nameBn: 'বাংলাদেশ কৃষি গবেষণা ইনস্টিটিউট (বারি)',
    lat: 24.0850,
    lng: 90.2700,
    address: 'Gazipur, Bangladesh',
    addressBn: 'গাজীপুর, বাংলাদেশ',
    type: 'institute',
    phone: '+880-2-9205310'
  },
  {
    id: 3,
    name: 'Bangladesh Rice Research Institute (BRRI)',
    nameBn: 'বাংলাদেশ ধান গবেষণা ইনস্টিটিউট (ব্রি)',
    lat: 24.0850,
    lng: 90.2700,
    address: 'Gazipur, Bangladesh',
    addressBn: 'গাজীপুর, বাংলাদেশ',
    type: 'institute',
    phone: '+880-2-9205300'
  },
  {
    id: 4,
    name: 'Chittagong Agriculture Office',
    nameBn: 'চট্টগ্রাম কৃষি অফিস',
    lat: 22.3569,
    lng: 91.7832,
    address: 'Chittagong, Bangladesh',
    addressBn: 'চট্টগ্রাম, বাংলাদেশ',
    type: 'office',
    phone: '+880-31-710123'
  },
  {
    id: 5,
    name: 'Khulna Agriculture Office',
    nameBn: 'খুলনা কৃষি অফিস',
    lat: 22.8456,
    lng: 89.5403,
    address: 'Khulna, Bangladesh',
    addressBn: 'খুলনা, বাংলাদেশ',
    type: 'office',
    phone: '+880-41-720456'
  },
  {
    id: 6,
    name: 'Rajshahi Agriculture Office',
    nameBn: 'রাজশাহী কৃষি অফিস',
    lat: 24.3636,
    lng: 88.6241,
    address: 'Rajshahi, Bangladesh',
    addressBn: 'রাজশাহী, বাংলাদেশ',
    type: 'office',
    phone: '+880-721-774123'
  },
  {
    id: 7,
    name: 'Sylhet Agriculture Office',
    nameBn: 'সিলেট কৃষি অফিস',
    lat: 24.8949,
    lng: 91.8687,
    address: 'Sylhet, Bangladesh',
    addressBn: 'সিলেট, বাংলাদেশ',
    type: 'office',
    phone: '+880-821-714567'
  },
  {
    id: 8,
    name: 'Bangladesh Agricultural University (BAU)',
    nameBn: 'বাংলাদেশ কৃষি বিশ্ববিদ্যালয় (বাকৃবি)',
    lat: 24.0850,
    lng: 90.2700,
    address: 'Mymensingh, Bangladesh',
    addressBn: 'ময়মনসিংহ, বাংলাদেশ',
    type: 'university',
    phone: '+880-91-67401'
  },
  {
    id: 9,
    name: 'Sher-e-Bangla Agricultural University',
    nameBn: 'শের-ই-বাংলা কৃষি বিশ্ববিদ্যালয়',
    lat: 22.8456,
    lng: 89.5403,
    address: 'Dhaka, Bangladesh',
    addressBn: 'ঢাকা, বাংলাদেশ',
    type: 'university',
    phone: '+880-2-9205311'
  },
  {
    id: 10,
    name: 'Bangladesh Institute of Nuclear Agriculture (BINA)',
    nameBn: 'বাংলাদেশ পারমাণবিক কৃষি ইনস্টিটিউট (বিনা)',
    lat: 24.0850,
    lng: 90.2700,
    address: 'Mymensingh, Bangladesh',
    addressBn: 'ময়মনসিংহ, বাংলাদেশ',
    type: 'institute',
    phone: '+880-91-61521'
  },
  {
    id: 11,
    name: 'Horticulture Research Center',
    nameBn: 'উদ্যান গবেষণা কেন্দ্র',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Joydebpur, Gazipur',
    addressBn: 'জয়দেবপুর, গাজীপুর',
    type: 'center',
    phone: '+880-2-9205305'
  },
  {
    id: 12,
    name: 'Soil Resource Development Institute',
    nameBn: 'মাটি সম্পদ উন্নয়ন ইনস্টিটিউট',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Dhaka, Bangladesh',
    addressBn: 'ঢাকা, বাংলাদেশ',
    type: 'institute',
    phone: '+880-2-9111235'
  },
  {
    id: 13,
    name: 'Bangladesh Sugarcane Research Institute',
    nameBn: 'বাংলাদেশ আখ গবেষণা ইনস্টিটিউট',
    lat: 24.0850,
    lng: 90.2700,
    address: 'Ishwardi, Pabna',
    addressBn: 'ঈশ্বরদী, পাবনা',
    type: 'institute',
    phone: '+880-731-250123'
  },
  {
    id: 14,
    name: 'Cotton Development Board',
    nameBn: 'তুলা উন্নয়ন বোর্ড',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Dhaka, Bangladesh',
    addressBn: 'ঢাকা, বাংলাদেশ',
    type: 'center',
    phone: '+880-2-9551234'
  },
  {
    id: 15,
    name: 'Tea Research Institute',
    nameBn: 'চা গবেষণা ইনস্টিটিউট',
    lat: 24.3636,
    lng: 88.6241,
    address: 'Srimangal, Moulvibazar',
    addressBn: 'শ্রীমঙ্গল, মৌলভীবাজার',
    type: 'institute',
    phone: '+880-862-650123'
  }
];

const haversineDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const MapComponent: React.FC<MapComponentProps> = ({ lang }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearestOffices, setNearestOffices] = useState<Office[]>(agriculturalOffices);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [routingControl, setRoutingControl] = useState<any>(null);
  const [directionsVisible, setDirectionsVisible] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup routing control on unmount
      if (routingControl && mapInstance) {
        mapInstance.removeControl(routingControl);
      }
      // Cleanup map instance
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, [routingControl, mapInstance]);

  useEffect(() => {
    if (selectedOffice && userLocation && mapInstance && !routingControl) {
      createRoute(selectedOffice);
    }
  }, [selectedOffice, userLocation, mapInstance, routingControl]);

  const handleMapReady = () => {
    if (mapRef.current && !isMapReady) {
      setMapInstance(mapRef.current);
      setIsMapReady(true);
    }
  };

  useEffect(() => {
    // Set map as loaded after a short delay to ensure DOM is ready
    const timer = setTimeout(() => setMapLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);
          setLocationError(null);

          // Calculate distances and sort offices
          const officesWithDistance = agriculturalOffices.map(office => ({
            ...office,
            distance: haversineDistance(latitude, longitude, office.lat, office.lng)
          })).sort((a, b) => a.distance - b.distance);

          setNearestOffices(officesWithDistance.slice(0, 8));
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError(`Location error: ${error.message}`);
          setLoading(false);
          // Fallback to Dhaka if location not available
          setUserLocation({ lat: 23.8103, lng: 90.4125 });
          const officesWithDistance = agriculturalOffices.map(office => ({
            ...office,
            distance: haversineDistance(23.8103, 90.4125, office.lat, office.lng)
          })).sort((a, b) => a.distance - b.distance);
          setNearestOffices(officesWithDistance.slice(0, 8));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    } else {
      setLocationError('Geolocation not supported');
      setLoading(false);
      setUserLocation({ lat: 23.8103, lng: 90.4125 });
      const officesWithDistance = agriculturalOffices.map(office => ({
        ...office,
        distance: haversineDistance(23.8103, 90.4125, office.lat, office.lng)
      })).sort((a, b) => a.distance - b.distance);
      setNearestOffices(officesWithDistance.slice(0, 5));
    }
  }, []);

  const requestLocation = () => {
    setLoading(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setLoading(false);

          const officesWithDistance = agriculturalOffices.map(office => ({
            ...office,
            distance: haversineDistance(latitude, longitude, office.lat, office.lng)
          })).sort((a, b) => a.distance - b.distance);

          setNearestOffices(officesWithDistance.slice(0, 8));
        },
        (error) => {
          setLocationError(`Failed to get location: ${error.message}`);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    }
  };

  const createRoute = (office: Office) => {
    if (!userLocation || !mapInstance) return;

    // Remove existing route
    if (routingControl) {
      mapInstance.removeControl(routingControl);
    }

    const control = (L as any).Routing.control({
      waypoints: [
        L.latLng(userLocation.lat, userLocation.lng),
        L.latLng(office.lat, office.lng)
      ],
      routeWhileDragging: true,
      createMarker: () => null, // Don't create default markers
      lineOptions: {
        styles: [{ color: '#22c55e', weight: 6, opacity: 0.8 }]
      },
      show: false, // Hide the default instructions panel
      addWaypoints: false
    }).addTo(mapInstance);

    control.on('routesfound', (e: any) => {
      const route = e.routes[0];
      const distance = (route.summary.totalDistance / 1000).toFixed(1);
      const time = Math.round(route.summary.totalTime / 60);

      setRouteInfo({
        distance: `${distance} km`,
        time: `${time} min`
      });
      setDirectionsVisible(true);
    });

    setRoutingControl(control);
    setSelectedOffice(office);
  };

  const clearRoute = () => {
    if (routingControl && mapInstance) {
      mapInstance.removeControl(routingControl);
      setRoutingControl(null);
    }
    setDirectionsVisible(false);
    setRouteInfo(null);
    setSelectedOffice(null);
  };

  const getOfficeIcon = (type: string) => {
    switch (type) {
      case 'institute':
        return '🏛️';
      case 'university':
        return '🎓';
      case 'center':
        return '🏢';
      default:
        return '🏛️';
    }
  };

  const defaultCenter = userLocation || { lat: 23.8103, lng: 90.4125 };
  const defaultZoom = userLocation ? 10 : 7;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="mb-4">{lang === 'bn' ? 'লোকেশন লোড হচ্ছে...' : 'Loading location...'}</p>
          <button
            onClick={requestLocation}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg"
          >
            {lang === 'bn' ? 'লোকেশন অনুমতি দিন' : 'Grant Location Access'}
          </button>
          {locationError && (
            <p className="text-red-500 text-sm mt-2">{locationError}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{lang === 'bn' ? 'নিকটবর্তী কৃষি কেন্দ্র' : 'Nearest Agriculture Centers'}</h3>
            {directionsVisible && (
              <button
                onClick={clearRoute}
                className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                {lang === 'bn' ? 'রুট মুছুন' : 'Clear Route'}
              </button>
            )}
          </div>

          {/* Directions Panel */}
          {directionsVisible && routeInfo && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-800 dark:text-blue-200">
                  {lang === 'bn' ? 'দিকনির্দেশ' : 'Directions'}
                </h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-600" />
                  <span>{lang === 'bn' ? 'দূরত্ব:' : 'Distance:'} {routeInfo.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span>{lang === 'bn' ? 'সময়:' : 'Time:'} {routeInfo.time}</span>
                </div>
              </div>
            </div>
          )}

          {nearestOffices.length > 0 ? nearestOffices.map((office, index) => (
            <div
              key={office.id}
              className={`p-4 bg-white dark:bg-zinc-800 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                selectedOffice?.id === office.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-zinc-100 dark:border-zinc-700 hover:border-green-500'
              }`}
              onClick={() => setSelectedOffice(office)}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg group-hover:bg-green-100 ${
                  selectedOffice?.id === office.id ? 'bg-green-100' : 'bg-green-50 dark:bg-green-900/20'
                }`}>
                  <span className="text-lg">{getOfficeIcon(office.type)}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">
                    {lang === 'bn' ? office.nameBn : office.name}
                  </h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    {office.distance ? `${office.distance.toFixed(1)} km ${lang === 'bn' ? 'দূরে' : 'away'}` : 'Calculating...'}
                  </p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {lang === 'bn' ? office.addressBn : office.address}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        createRoute(office);
                      }}
                      className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      {lang === 'bn' ? 'রুট দেখুন' : 'Get Directions'}
                    </button>
                    {office.phone && (
                      <a
                        href={`tel:${office.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                      >
                        📞
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center text-zinc-500 py-8">
              {lang === 'bn' ? 'কেন্দ্র লোড হচ্ছে...' : 'Loading centers...'}
            </div>
          )}
        </div>

        <div className="md:col-span-3 relative h-[500px] bg-zinc-200 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-inner">
          {/* Location Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={requestLocation}
              className="p-3 bg-white dark:bg-zinc-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 transition-all"
              title={lang === 'bn' ? 'আমার লোকেশন খুঁজুন' : 'Find My Location'}
            >
              <Navigation className="w-5 h-5 text-green-600" />
            </button>
            {locationError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs text-red-600 dark:text-red-400">
                {locationError}
              </div>
            )}
          </div>

          <div 
            ref={mapContainerRef}
            className="w-full h-full rounded-3xl"
            style={{ display: mapLoaded ? 'block' : 'none' }}
          >
            <MapContainer
              center={[defaultCenter.lat, defaultCenter.lng]}
              zoom={defaultZoom}
              style={{ height: '100%', width: '100%', borderRadius: '1.5rem' }}
              className="rounded-3xl"
              ref={mapRef}
              whenReady={handleMapReady}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]}>
                  <Popup>
                    <div className="text-center">
                      <div className="font-bold text-blue-600">
                        {lang === 'bn' ? 'আপনার অবস্থান' : 'Your Location'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              )}
              {nearestOffices.map((office) => {
                const customIcon = L.divIcon({
                  html: `<div style="background-color: ${selectedOffice?.id === office.id ? '#22c55e' : '#3b82f6'}; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${getOfficeIcon(office.type)}</div>`,
                  className: 'custom-office-marker',
                  iconSize: [30, 30],
                  iconAnchor: [15, 15]
                });

                return (
                  <Marker key={office.id} position={[office.lat, office.lng]} icon={customIcon}>
                    <Popup>
                      <div className="text-center min-w-[200px]">
                        <div className="font-bold text-green-600 mb-2">
                          {lang === 'bn' ? office.nameBn : office.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {lang === 'bn' ? office.addressBn : office.address}
                        </div>
                        {office.distance && (
                          <div className="text-xs text-gray-500 mb-2">
                            {office.distance.toFixed(1)} km {lang === 'bn' ? 'দূরে' : 'away'}
                          </div>
                        )}
                        {office.phone && (
                          <div className="text-xs text-gray-500 mb-2">
                            📞 {office.phone}
                          </div>
                        )}
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => createRoute(office)}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                          >
                            {lang === 'bn' ? 'রুট দেখুন' : 'Get Directions'}
                          </button>
                          {office.phone && (
                            <a
                              href={`tel:${office.phone}`}
                              className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                            >
                              {lang === 'bn' ? 'কল করুন' : 'Call'}
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          {!mapLoaded && (
            <div className="flex items-center justify-center h-full absolute inset-0">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                <p className="text-sm text-zinc-500">{lang === 'bn' ? 'ম্যাপ লোড হচ্ছে...' : 'Loading map...'}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
