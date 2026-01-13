// @ts-nocheck

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Info, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import L from 'leaflet';

// Fix for default markers in react-leaflet
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
  id: string;
  name: string;
  nameBn: string;
  type: string;
  typeBn: string;
  lat: number;
  lng: number;
  address: string;
  addressBn: string;
  phone?: string;
  distance?: number;
}

// Mock agricultural offices in Bangladesh (covering major divisions)
const mockOffices: Office[] = [
  // Dhaka Division
  {
    id: '1',
    name: 'Dhaka Upazila Agriculture Office',
    nameBn: 'ঢাকা উপজেলা কৃষি অফিস',
    type: 'Upazila Agri Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    lat: 23.8103,
    lng: 90.4125,
    address: 'Dhaka, Bangladesh',
    addressBn: 'ঢাকা, বাংলাদেশ',
    phone: '+880 2 1234567'
  },
  {
    id: '2',
    name: 'Regional Extension Center Gazipur',
    nameBn: 'গাজীপুর আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 23.9999,
    lng: 90.4203,
    address: 'Gazipur, Bangladesh',
    addressBn: 'গাজীপুর, বাংলাদেশ',
    phone: '+880 2 7654321'
  },
  {
    id: '3',
    name: 'Soil Testing Laboratory Savar',
    nameBn: 'সাভার মাটি পরীক্ষণ ল্যাব',
    type: 'Soil Testing Lab',
    typeBn: 'মাটি পরীক্ষণ ল্যাব',
    lat: 23.8700,
    lng: 90.2600,
    address: 'Savar, Dhaka',
    addressBn: 'সাভার, ঢাকা',
    phone: '+880 2 9876543'
  },
  {
    id: '4',
    name: 'Narayanganj Agriculture Office',
    nameBn: 'নারায়ণগঞ্জ কৃষি অফিস',
    type: 'Upazila Agri Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    lat: 23.6238,
    lng: 90.5000,
    address: 'Narayanganj, Bangladesh',
    addressBn: 'নারায়ণগঞ্জ, বাংলাদেশ',
    phone: '+880 2 1122334'
  },
  {
    id: '5',
    name: 'Tangail Extension Center',
    nameBn: 'টাঙ্গাইল সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 24.2513,
    lng: 89.9167,
    address: 'Tangail, Bangladesh',
    addressBn: 'টাঙ্গাইল, বাংলাদেশ',
    phone: '+880 921 556677'
  },

  // Sylhet Division
  {
    id: '6',
    name: 'Sylhet Agriculture Directorate',
    nameBn: 'সিলেট কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 24.8949,
    lng: 91.8687,
    address: 'Sylhet, Bangladesh',
    addressBn: 'সিলেট, বাংলাদেশ',
    phone: '+880 821 714001'
  },
  {
    id: '7',
    name: 'Moulvibazar Upazila Agriculture Office',
    nameBn: 'মৌলভীবাজার উপজেলা কৃষি অফিস',
    type: 'Upazila Agri Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    lat: 24.4854,
    lng: 91.7774,
    address: 'Moulvibazar, Sylhet',
    addressBn: 'মৌলভীবাজার, সিলেট',
    phone: '+880 861 62801'
  },
  {
    id: '8',
    name: 'Sunamganj Soil Testing Lab',
    nameBn: 'সুনামগঞ্জ মাটি পরীক্ষণ ল্যাব',
    type: 'Soil Testing Lab',
    typeBn: 'মাটি পরীক্ষণ ল্যাব',
    lat: 25.0658,
    lng: 91.3950,
    address: 'Sunamganj, Sylhet',
    addressBn: 'সুনামগঞ্জ, সিলেট',
    phone: '+880 871 55234'
  },
  {
    id: '9',
    name: 'Habiganj Extension Center',
    nameBn: 'হবিগঞ্জ সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 24.3800,
    lng: 91.4150,
    address: 'Habiganj, Sylhet',
    addressBn: 'হবিগঞ্জ, সিলেট',
    phone: '+880 831 62245'
  },

  // Chittagong Division
  {
    id: '10',
    name: 'Chittagong Agriculture Directorate',
    nameBn: 'চট্টগ্রাম কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 22.3569,
    lng: 91.7832,
    address: 'Chittagong, Bangladesh',
    addressBn: 'চট্টগ্রাম, বাংলাদেশ',
    phone: '+880 31 610001'
  },
  {
    id: '11',
    name: 'Coxs Bazar Agriculture Office',
    nameBn: 'কক্সবাজার কৃষি অফিস',
    type: 'Upazila Agri Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    lat: 21.4272,
    lng: 92.0058,
    address: 'Coxs Bazar, Chittagong',
    addressBn: 'কক্সবাজার, চট্টগ্রাম',
    phone: '+880 341 62501'
  },
  {
    id: '12',
    name: 'Comilla Extension Center',
    nameBn: 'কুমিল্লা সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 23.4607,
    lng: 91.1809,
    address: 'Comilla, Chittagong',
    addressBn: 'কুমিল্লা, চট্টগ্রাম',
    phone: '+880 81 76456'
  },

  // Khulna Division
  {
    id: '13',
    name: 'Khulna Agriculture Directorate',
    nameBn: 'খুলনা কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 22.8456,
    lng: 89.5403,
    address: 'Khulna, Bangladesh',
    addressBn: 'খুলনা, বাংলাদেশ',
    phone: '+880 41 720001'
  },
  {
    id: '14',
    name: 'Jessore Soil Testing Lab',
    nameBn: 'যশোর মাটি পরীক্ষণ ল্যাব',
    type: 'Soil Testing Lab',
    typeBn: 'মাটি পরীক্ষণ ল্যাব',
    lat: 23.1778,
    lng: 89.1800,
    address: 'Jessore, Khulna',
    addressBn: 'যশোর, খুলনা',
    phone: '+880 421 61234'
  },
  {
    id: '15',
    name: 'Satkhira Extension Center',
    nameBn: 'সাতক্ষীরা সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 22.7080,
    lng: 89.0720,
    address: 'Satkhira, Khulna',
    addressBn: 'সাতক্ষীরা, খুলনা',
    phone: '+880 471 62345'
  },

  // Rajshahi Division
  {
    id: '16',
    name: 'Rajshahi Agriculture Directorate',
    nameBn: 'রাজশাহী কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 24.3636,
    lng: 88.6241,
    address: 'Rajshahi, Bangladesh',
    addressBn: 'রাজশাহী, বাংলাদেশ',
    phone: '+880 721 770001'
  },
  {
    id: '17',
    name: 'Bogra Agriculture Office',
    nameBn: 'বগুড়া কৃষি অফিস',
    type: 'Upazila Agri Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    lat: 24.8466,
    lng: 89.3773,
    address: 'Bogra, Rajshahi',
    addressBn: 'বগুড়া, রাজশাহী',
    phone: '+880 51 66234'
  },
  {
    id: '18',
    name: 'Pabna Soil Testing Lab',
    nameBn: 'পাবনা মাটি পরীক্ষণ ল্যাব',
    type: 'Soil Testing Lab',
    typeBn: 'মাটি পরীক্ষণ ল্যাব',
    lat: 24.0064,
    lng: 89.2372,
    address: 'Pabna, Rajshahi',
    addressBn: 'পাবনা, রাজশাহী',
    phone: '+880 731 62345'
  },

  // Barisal Division
  {
    id: '19',
    name: 'Barisal Agriculture Directorate',
    nameBn: 'বরিশাল কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 22.7010,
    lng: 90.3535,
    address: 'Barisal, Bangladesh',
    addressBn: 'বরিশাল, বাংলাদেশ',
    phone: '+880 431 61701'
  },
  {
    id: '20',
    name: 'Patuakhali Extension Center',
    nameBn: 'পটুয়াখালী সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 22.3596,
    lng: 90.3296,
    address: 'Patuakhali, Barisal',
    addressBn: 'পটুয়াখালী, বরিশাল',
    phone: '+880 441 62345'
  },

  // Rangpur Division
  {
    id: '21',
    name: 'Rangpur Agriculture Directorate',
    nameBn: 'রংপুর কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 25.7439,
    lng: 89.2752,
    address: 'Rangpur, Bangladesh',
    addressBn: 'রংপুর, বাংলাদেশ',
    phone: '+880 521 62345'
  },
  {
    id: '22',
    name: 'Dinajpur Agriculture Office',
    nameBn: 'দিনাজপুর কৃষি অফিস',
    type: 'Upazila Agri Office',
    typeBn: 'উপজেলা কৃষি অফিস',
    lat: 25.6279,
    lng: 88.6378,
    address: 'Dinajpur, Rangpur',
    addressBn: 'দিনাজপুর, রংপুর',
    phone: '+880 531 61234'
  },

  // Mymensingh Division
  {
    id: '23',
    name: 'Mymensingh Agriculture Directorate',
    nameBn: 'ময়মনসিংহ কৃষি অধিদপ্তর',
    type: 'Directorate Office',
    typeBn: 'অধিদপ্তর কার্যালয়',
    lat: 24.7471,
    lng: 90.4203,
    address: 'Mymensingh, Bangladesh',
    addressBn: 'ময়মনসিংহ, বাংলাদেশ',
    phone: '+880 91 62345'
  },
  {
    id: '24',
    name: 'Jamalpur Extension Center',
    nameBn: 'জামালপুর সম্প্রসারণ কেন্দ্র',
    type: 'Regional Extension Center',
    typeBn: 'আঞ্চলিক সম্প্রসারণ কেন্দ্র',
    lat: 24.9375,
    lng: 89.9481,
    address: 'Jamalpur, Mymensingh',
    addressBn: 'জামালপুর, ময়মনসিংহ',
    phone: '+880 981 62345'
  }
];

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Default center (Central Bangladesh - somewhere between Dhaka and other divisions)
const defaultCenter: [number, number] = [24.0, 90.5];

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)}m`;
  }
  return `${distance.toFixed(1)}km`;
};

// Memoized map display component to prevent re-initialization
const MapDisplay = React.memo(({ userLocation, offices, lang, setSelectedOffice }: { userLocation: [number, number] | null, offices: Office[], lang: Language, setSelectedOffice: (office: Office) => void }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const getDirectionsUrl = (office: Office): string => {
    if (!userLocation) return '#';
    const [userLat, userLng] = userLocation;
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${office.lat},${office.lng}`;
  };

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, {
        center: defaultCenter,
        zoom: 7
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing markers
      mapInstanceRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapInstanceRef.current!.removeLayer(layer);
        }
      });

      // Add user location
      if (userLocation) {
        L.marker(userLocation).addTo(mapInstanceRef.current).bindPopup(
          `<div class="text-center">
            <div class="font-bold text-blue-600">
              ${lang === 'bn' ? 'আপনার লোকেশন' : 'Your Location'}
            </div>
            <div class="text-sm text-zinc-600">
              ${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}
            </div>
          </div>`
        );
        mapInstanceRef.current.setView(userLocation, 12);
      } else {
        mapInstanceRef.current.setView(defaultCenter, 7);
      }

      // Add office markers
      offices.forEach((office) => {
        const marker = L.marker([office.lat, office.lng]).addTo(mapInstanceRef.current!);
        marker.bindPopup(
          `<div class="min-w-[200px]">
            <h3 class="font-bold text-green-600 mb-2">
              ${lang === 'bn' ? office.nameBn : office.name}
            </h3>
            <p class="text-sm text-zinc-600 mb-2">
              ${lang === 'bn' ? office.typeBn : office.type}
            </p>
            <p class="text-sm text-zinc-500 mb-3">
              ${lang === 'bn' ? office.addressBn : office.address}
            </p>
            ${office.distance !== undefined ? `<p class="text-sm text-green-600 font-medium mb-2">📍 ${formatDistance(office.distance)} ${lang === 'bn' ? 'দূরে' : 'away'}</p>` : ''}
            ${office.phone ? `<p class="text-sm text-zinc-600 mb-3">📞 ${office.phone}</p>` : ''}
            ${userLocation ? `<a href="${getDirectionsUrl(office)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>${lang === 'bn' ? 'দিকনির্দেশনা' : 'Directions'}</a>` : ''}
          </div>`
        );
        marker.on('click', () => setSelectedOffice(office));
      });
    }
  }, [userLocation, offices, lang, setSelectedOffice]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} className="rounded-3xl" />;
});

export const MapComponent: React.FC<MapComponentProps> = ({ lang }) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [offices, setOffices] = useState<Office[]>(mockOffices);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError(lang === 'bn' ? 'আপনার ব্রাউজার জিওলোকেশন সমর্থন করে না' : 'Your browser does not support geolocation');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        // Calculate distances and sort offices
        const officesWithDistance = mockOffices.map(office => ({
          ...office,
          distance: calculateDistance(latitude, longitude, office.lat, office.lng)
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setOffices(officesWithDistance);
        setLoading(false);
      },
      (error) => {
        let errorMessage = lang === 'bn' ? 'লোকেশন পাওয়া যায়নি' : 'Location access denied';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = lang === 'bn' ? 'লোকেশন অনুমতি অস্বীকার করা হয়েছে' : 'Location access denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = lang === 'bn' ? 'লোকেশন তথ্য পাওয়া যাচ্ছে না' : 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = lang === 'bn' ? 'লোকেশন অনুরোধের সময় শেষ' : 'Location request timeout';
            break;
        }
        setLocationError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const getDirectionsUrl = (office: Office): string => {
    if (!userLocation) return '#';
    const [userLat, userLng] = userLocation;
    return `https://www.google.com/maps/dir/${userLat},${userLng}/${office.lat},${office.lng}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-6">
        {/* Office List */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{lang === 'bn' ? 'অফিসের তালিকা' : 'Office List'}</h3>
            {!userLocation && (
              <button
                onClick={requestLocation}
                disabled={loading}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white text-sm font-bold rounded-lg transition-all flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                {lang === 'bn' ? 'লোকেশন' : 'Location'}
              </button>
            )}
          </div>

          {locationError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
              {locationError}
            </div>
          )}

          {userLocation && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm mb-4">
              ✅ {lang === 'bn' ? 'লোকেশন পাওয়া গেছে' : 'Location found'}
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {offices.map((office, index) => (
              <div
                key={office.id}
                onClick={() => setSelectedOffice(office)}
                className={`p-4 bg-white dark:bg-zinc-800 rounded-2xl border transition-all cursor-pointer group shadow-sm ${
                  selectedOffice?.id === office.id
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'border-zinc-100 dark:border-zinc-700 hover:border-green-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg group-hover:bg-green-100 flex-shrink-0 ${
                    selectedOffice?.id === office.id ? 'bg-green-100' : 'bg-green-50 dark:bg-green-900/20'
                  }`}>
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-zinc-100 dark:bg-zinc-700 px-2 py-1 rounded-full font-medium">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-sm truncate">
                        {lang === 'bn' ? office.nameBn : office.name}
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">
                      {lang === 'bn' ? office.typeBn : office.type}
                    </p>
                    {office.distance !== undefined && (
                      <p className="text-xs text-green-600 font-medium">
                        {formatDistance(office.distance)} {lang === 'bn' ? 'দূরে' : 'away'}
                      </p>
                    )}
                    {office.phone && (
                      <p className="text-xs text-zinc-400 mt-1">{office.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="md:col-span-3 relative h-[500px] bg-zinc-200 dark:bg-zinc-800 rounded-3xl overflow-hidden shadow-inner">
          <MapDisplay userLocation={userLocation} offices={offices} lang={lang} setSelectedOffice={setSelectedOffice} />

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white z-[1000]">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-lg font-bold">
                {lang === 'bn' ? 'লোকেশন খুঁজছি...' : 'Finding your location...'}
              </p>
            </div>
          )}

          {/* Initial prompt overlay */}
          {!userLocation && !loading && (
            <div className="absolute inset-0 flex items-center justify-center z-[1000]">
              <div className="text-center bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl max-w-sm border border-zinc-100 dark:border-zinc-800">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Navigation className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-extrabold mb-2">
                  {lang === 'bn' ? 'ম্যাপ লোড হচ্ছে' : 'Initializing Map'}
                </h3>
                <p className="text-zinc-500 text-sm mb-6">
                  {lang === 'bn' ? 'আপনার নিকটবর্তী কৃষি সাহায্য কেন্দ্রগুলো ম্যাপে দেখতে জিওলোকেশন ব্যবহার করুন।' : 'Using geolocation to find your nearest agriculture assistance centers on the map.'}
                </p>
                <button
                  onClick={requestLocation}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-600/20"
                >
                  {lang === 'bn' ? 'লোকেশন অনুমতি দিন' : 'Grant Location Access'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Office Details */}
      {selectedOffice && (
        <div className="bg-white dark:bg-zinc-800 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-700 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-2xl">
              <Info className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-green-600 mb-2">
                {lang === 'bn' ? selectedOffice.nameBn : selectedOffice.name}
              </h3>
              <p className="text-zinc-600 dark:text-zinc-300 mb-3">
                {lang === 'bn' ? selectedOffice.typeBn : selectedOffice.type}
              </p>
              <p className="text-zinc-500 mb-3">
                📍 {lang === 'bn' ? selectedOffice.addressBn : selectedOffice.address}
              </p>
              {selectedOffice.distance !== undefined && (
                <p className="text-green-600 font-medium mb-3">
                  📍 {formatDistance(selectedOffice.distance)} {lang === 'bn' ? 'দূরে' : 'away'}
                </p>
              )}
              {selectedOffice.phone && (
                <p className="text-zinc-600 mb-4">
                  📞 {selectedOffice.phone}
                </p>
              )}
              {userLocation && (
                <a
                  href={getDirectionsUrl(selectedOffice)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg shadow-green-600/20"
                >
                  <ExternalLink className="w-4 h-4" />
                  {lang === 'bn' ? 'দিকনির্দেশনা পান' : 'Get Directions'}
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
