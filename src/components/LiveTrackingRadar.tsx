import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Phone, MessageSquare, Navigation, CheckCircle2, 
  MapPin, Clock, Gauge, Compass, Play, Pause,
  RotateCcw, Sparkles, X, ChevronRight, HardHat, Star,
  Radio, Maximize2, Minimize2, Share2, ShieldCheck,
  Send, AlertTriangle, Layers, Flame, Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobOrder } from '../types';
import { playNotificationSound, speakUzbek } from '../utils/sound';

interface LiveTrackingRadarProps {
  job: JobOrder;
  allJobs?: JobOrder[];
  onClose: () => void;
  onUpdateJobStatus: (jobId: string, status: JobOrder['status']) => void;
  onRequestReview?: (job: JobOrder) => void;
  onOpenChat?: (job: JobOrder) => void;
  onOpenCompleteModal?: (job: JobOrder) => void;
  onWorkerApproaching?: (job: JobOrder, distanceKm: number, etaMinutes: number) => void;
  onSendMessage?: (jobId: string, text: string, senderRole: 'employer' | 'worker') => void;
  currentRole?: 'employer' | 'worker';
}

// Top active demand hotspots in Samarkand with job volume
export interface SamarkandDemandHotspot {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  activeOrders: number;
  topCategory: string;
  intensity: number;
}

export const SAMARKAND_HOTSPOTS: SamarkandDemandHotspot[] = [
  {
    id: 'spot-registon',
    name: "Registon / Markaz",
    district: "Samarqand shahri (Markaz / Registon)",
    lat: 39.6542,
    lng: 66.9597,
    activeOrders: 14,
    topCategory: "General Uborka, G'isht, Fasad",
    intensity: 1.0
  },
  {
    id: 'spot-sugdiyona',
    name: "Sug'diyona mavzesi",
    district: "Samarqand shahri (Sug'diyona)",
    lat: 39.6720,
    lng: 66.9380,
    activeOrders: 10,
    topCategory: "Kafel, Suvoq, Duradgorlik",
    intensity: 0.9
  },
  {
    id: 'spot-siyob',
    name: "Siyob bozori / Dahbed",
    district: "Samarqand shahri (Siyob bozori)",
    lat: 39.6640,
    lng: 66.9820,
    activeOrders: 12,
    topCategory: "Yuk mardikor, Talabalar, Tom",
    intensity: 0.95
  },
  {
    id: 'spot-motrid',
    name: "Motrid mavzesi",
    district: "Samarqand shahri (Motrid)",
    lat: 39.6950,
    lng: 66.9450,
    activeOrders: 7,
    topCategory: "Malyarka, Shpaklyovka",
    intensity: 0.75
  },
  {
    id: 'spot-vokzal',
    name: "Temiryo'l vokzali",
    district: "Samarqand shahri (Temiryo'l vokzal)",
    lat: 39.6840,
    lng: 66.9240,
    activeOrders: 8,
    topCategory: "Elektr montaj, Svarka, Mebel",
    intensity: 0.8
  },
  {
    id: 'spot-urgut',
    name: "Urgut tumani",
    district: "Urgut tumani",
    lat: 39.4050,
    lng: 67.2450,
    activeOrders: 9,
    topCategory: "Qurilish, Hovli, Tom krovlya",
    intensity: 0.85
  },
  {
    id: 'spot-toyloq',
    name: "Toyloq tumani",
    district: "Toyloq tumani",
    lat: 39.6050,
    lng: 67.0450,
    activeOrders: 5,
    topCategory: "Poydevor, G'isht, Qora ish",
    intensity: 0.65
  },
  {
    id: 'spot-pastdargom',
    name: "Pastdarg'om tumani",
    district: "Pastdarg'om tumani",
    lat: 39.5850,
    lng: 66.7550,
    activeOrders: 5,
    topCategory: "Suvoq, Bruschatka, Tandir",
    intensity: 0.65
  }
];

// Precise Haversine distance calculator in kilometers
function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return +(R * c).toFixed(2);
}

export function LiveTrackingRadar({ 
  job, 
  allJobs,
  onClose, 
  onUpdateJobStatus, 
  onRequestReview, 
  onOpenChat,
  onOpenCompleteModal,
  onWorkerApproaching,
  onSendMessage,
  currentRole = 'employer'
}: LiveTrackingRadarProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const workerMarkerRef = useRef<L.Marker | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const completedPolylineRef = useRef<L.Polyline | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const heatLayerRef = useRef<any>(null);
  const hotspotMarkersRef = useRef<L.LayerGroup | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Heatmap State: active by default to visualize Samarkand job demand density
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [activeHotspotFilter, setActiveHotspotFilter] = useState<string | null>(null);

  // Simulation & GPS State
  const [progress, setProgress] = useState(0.28); // 0 (start) to 1 (arrived)
  const [isSimulating, setIsSimulating] = useState(job.status === 'en_route');
  const [simulationSpeed, setSimulationSpeed] = useState<1 | 2 | 4>(1);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(28);
  const [realGpsActive, setRealGpsActive] = useState(false);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [quickMessageSent, setQuickMessageSent] = useState<string | null>(null);
  const [customStatus, setCustomStatus] = useState<JobOrder['status']>(job.status);
  const [isExpandedMap, setIsExpandedMap] = useState(false);
  const [audioPlayedForArrival, setAudioPlayedForArrival] = useState(false);
  const [audioPlayedForProximity, setAudioPlayedForProximity] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [shareNotificationMessage, setShareNotificationMessage] = useState<string | null>(null);

  // Real-time Chat Drawer within radar
  const [isChatDrawerOpen, setIsChatDrawerOpen] = useState(false);
  const [chatMessageText, setChatMessageText] = useState('');

  // Share Live Location: sends public tracking URL link via clipboard to third parties
  const handleShareLiveLocation = () => {
    const trackingUrl = `${window.location.origin}${window.location.pathname}?trackJob=${job.id}&live=1`;
    
    const notifySuccess = () => {
      setShareCopied(true);
      setShareNotificationMessage("Jonli lokatsiya havolasi nusxalandi! Uchinchi shaxslarga (Telegram, WhatsApp, SMS) yuborishingiz mumkin.");
      setTimeout(() => setShareCopied(false), 3500);
      setTimeout(() => setShareNotificationMessage(null), 6000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(trackingUrl)
        .then(notifySuccess)
        .catch(() => fallbackCopy(trackingUrl, notifySuccess));
    } else {
      fallbackCopy(trackingUrl, notifySuccess);
    }

    if (navigator.share) {
      navigator.share({
        title: `HalolMehnat.uz: ${job.workerName || 'Usta'} jonli GPS-kuzatuv xaritasi`,
        text: `📍 ${job.title} buyurtmasi bo'yicha usta harakatini jonli kuzating (${job.locationAddress}):`,
        url: trackingUrl
      }).catch(() => {});
    }
  };

  const fallbackCopy = (text: string, cb: () => void) => {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      document.execCommand('copy');
      cb();
    } catch (e) {
      console.error(e);
    }
    document.body.removeChild(el);
  };

  // Validate coordinates are strictly within Samarkand Province (39.0 - 40.5 Lat, 66.0 - 68.0 Lng)
  const isSamarkandCoord = (lat?: number, lng?: number) => 
    Boolean(lat && lng && lat >= 39.0 && lat <= 40.5 && lng >= 66.0 && lng <= 68.0);

  // Start coordinates in Samarkand (Worker's base, e.g. Sug'diyona / Registon)
  const originLat = isSamarkandCoord(job.workerCurrentCoords?.lat, job.workerCurrentCoords?.lng)
    ? job.workerCurrentCoords!.lat
    : 39.6720; // Sug'diyona, Samarqand
  const originLng = isSamarkandCoord(job.workerCurrentCoords?.lat, job.workerCurrentCoords?.lng)
    ? job.workerCurrentCoords!.lng
    : 66.9380;

  // Destination coordinates in Samarkand (Employer's job location)
  const destLat = isSamarkandCoord(job.targetCoords?.lat, job.targetCoords?.lng)
    ? job.targetCoords.lat
    : 39.6542; // Registon, Samarqand
  const destLng = isSamarkandCoord(job.targetCoords?.lat, job.targetCoords?.lng)
    ? job.targetCoords.lng
    : 66.9597;

  // Compute Heatmap Points across Samarkand from Hotspots + Active Job Orders
  const heatmapData = useMemo(() => {
    const points: [number, number, number][] = [];

    // 1. Hotspots density points with spatial clusters around Samarkand hubs
    SAMARKAND_HOTSPOTS.forEach(spot => {
      points.push([spot.lat, spot.lng, spot.intensity]);
      // Density spread points around the district hub
      for (let i = 0; i < spot.activeOrders; i++) {
        const offsetLat = (Math.sin(i * 1.7) * 0.004);
        const offsetLng = (Math.cos(i * 1.7) * 0.004);
        points.push([spot.lat + offsetLat, spot.lng + offsetLng, 0.75 + (i % 3) * 0.1]);
      }
    });

    // 2. Add real active job coordinates in Samarkand from current state
    if (allJobs && allJobs.length > 0) {
      allJobs.forEach(j => {
        if (j.targetCoords && isSamarkandCoord(j.targetCoords.lat, j.targetCoords.lng)) {
          const weight = j.urgent ? 1.0 : (j.status === 'open' ? 0.9 : 0.65);
          points.push([j.targetCoords.lat, j.targetCoords.lng, weight]);
        }
      });
    }

    return points;
  }, [allJobs]);

  // Real-time worker position (calculated by interpolation or real GPS)
  const [realWorkerCoords, setRealWorkerCoords] = useState<{ lat: number; lng: number } | null>(null);

  const currentWorkerLat = realGpsActive && realWorkerCoords 
    ? realWorkerCoords.lat 
    : originLat + (destLat - originLat) * progress;
    
  const currentWorkerLng = realGpsActive && realWorkerCoords 
    ? realWorkerCoords.lng 
    : originLng + (destLng - originLng) * progress;

  // Real distance calculations using Haversine
  const totalRouteDistanceKm = useMemo(() => {
    return Math.max(1.2, calculateHaversineKm(originLat, originLng, destLat, destLng) * 1.35); // +35% for road curve factor
  }, [originLat, originLng, destLat, destLng]);

  const rawRemainingKm = useMemo(() => {
    if (progress >= 1 || customStatus === 'arrived' || customStatus === 'in_progress' || customStatus === 'completed') {
      return 0;
    }
    const directRemaining = calculateHaversineKm(currentWorkerLat, currentWorkerLng, destLat, destLng) * 1.35;
    return Math.max(0.05, +directRemaining.toFixed(2));
  }, [currentWorkerLat, currentWorkerLng, destLat, destLng, progress, customStatus]);

  // Formatted display strings for distance & time
  const remainingDistanceDisplay = useMemo(() => {
    if (rawRemainingKm === 0 || progress >= 1) {
      return "0 metr (Yetib keldi)";
    }
    if (rawRemainingKm < 1.0) {
      const meters = Math.round(rawRemainingKm * 1000);
      return `${meters} metr qoldi`;
    }
    return `${rawRemainingKm.toFixed(1)} km qoldi`;
  }, [rawRemainingKm, progress]);

  const remainingMetersDetailed = useMemo(() => {
    if (rawRemainingKm === 0 || progress >= 1) return 0;
    return Math.round(rawRemainingKm * 1000);
  }, [rawRemainingKm, progress]);

  const estimatedMinutesLeft = useMemo(() => {
    if (rawRemainingKm === 0 || progress >= 1) return 0;
    // Assume average 28 km/h speed in city traffic (0.46 km/min)
    return Math.max(1, Math.ceil(rawRemainingKm / (currentSpeedKmh / 60)));
  }, [rawRemainingKm, progress, currentSpeedKmh]);

  // Proximity notification chime & alert (< 800m / approaching destination)
  useEffect(() => {
    if (rawRemainingKm > 0 && rawRemainingKm <= 0.8 && !audioPlayedForProximity && progress < 1) {
      setAudioPlayedForProximity(true);
      playNotificationSound('en_route');
      speakUzbek(`Diqqat! Usta ish joyingizga yaqinlashmoqda, taxminan ${estimatedMinutesLeft} daqiqada yetib keladi.`);
      onWorkerApproaching?.(job, rawRemainingKm, estimatedMinutesLeft);
    }
  }, [rawRemainingKm, audioPlayedForProximity, progress, estimatedMinutesLeft, job, onWorkerApproaching]);

  // Initialize Leaflet Map strictly within Samarkand
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        minZoom: 11.5,
        maxZoom: 18,
        maxBounds: [
          [39.20, 66.40], // South-West Samarkand Province (Pastdarg'om, Urgut, Tayloq)
          [39.95, 67.35]  // North-East Samarkand Province (Jomboy, Bulung'ur, Oqdaryo)
        ],
        maxBoundsViscosity: 1.0 // Strictly lock map viewport to Samarkand
      }).setView([destLat, destLng], 14);

      // Clean OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Zoom control in top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Employer Destination Icon (Samarkand)
      const employerIcon = L.divIcon({
        className: 'custom-employer-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-2.5 rounded-full bg-amber-500/30 animate-ping"></span>
            <div class="w-11 h-11 rounded-full bg-stone-900 border-2 border-amber-400 flex items-center justify-center shadow-xl text-white font-bold text-xs">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-400">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div class="absolute -bottom-6 px-2.5 py-0.5 bg-stone-900 text-amber-300 text-[10px] font-bold rounded-md shadow-md whitespace-nowrap border border-amber-400/40">
              📍 Ish joyi (${job.locationAddress.split(',')[0] || 'Samarqand'})
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      // Worker Moving Icon
      const workerIcon = L.divIcon({
        className: 'custom-worker-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-3 rounded-full bg-emerald-500/35 animate-pulse"></span>
            <div class="w-12 h-12 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-2xl overflow-hidden">
              <img src="${job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'}" class="w-full h-full object-cover" alt="Usta" />
            </div>
            <div class="absolute -top-3 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow">
              🚗 Yo'lda
            </div>
            <div class="absolute -bottom-6 px-2 py-0.5 bg-emerald-700 text-white text-[10px] font-bold rounded-md shadow whitespace-nowrap border border-emerald-400">
              ${job.workerName?.split(' ')[0] || 'Usta'} (${remainingDistanceDisplay})
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      // Add Employer Pin
      L.marker([destLat, destLng], { icon: employerIcon }).addTo(map)
        .bindPopup(`<b>Ish joyi:</b><br/>${job.locationAddress}`);

      // Add Worker Pin
      const workerMarker = L.marker([currentWorkerLat, currentWorkerLng], { icon: workerIcon }).addTo(map);
      workerMarkerRef.current = workerMarker;

      // Add Completed Route Polyline (Grayish)
      const completedPolyline = L.polyline([
        [originLat, originLng],
        [currentWorkerLat, currentWorkerLng]
      ], {
        color: '#94a3b8',
        weight: 4,
        opacity: 0.6,
      }).addTo(map);
      completedPolylineRef.current = completedPolyline;

      // Add Remaining Route Polyline (Glowing Emerald)
      const polyline = L.polyline([
        [currentWorkerLat, currentWorkerLng],
        [destLat, destLng]
      ], {
        color: '#059669',
        weight: 6,
        opacity: 0.85,
        dashArray: '8, 8',
      }).addTo(map);
      polylineRef.current = polyline;

      // Destination 80m arrival circle
      L.circle([destLat, destLng], {
        radius: 80,
        color: '#f59e0b',
        fillColor: '#fbbf24',
        fillOpacity: 0.15,
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);

      // Fit to route between worker and employer in Samarkand with safe padding
      const routeBounds = L.latLngBounds([
        [originLat, originLng],
        [destLat, destLng]
      ]);
      map.fitBounds(routeBounds, { padding: [45, 45], maxZoom: 15 });

      // Immediate & delayed size invalidation after modal render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
          mapInstanceRef.current.setView([destLat, destLng], 14);
        }
      }, 120);

      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 350);

      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (heatLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      if (hotspotMarkersRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(hotspotMarkersRef.current);
        hotspotMarkersRef.current = null;
      }
    };
  }, []);

  // Update marker & polyline when coordinates change
  useEffect(() => {
    if (workerMarkerRef.current && mapInstanceRef.current) {
      workerMarkerRef.current.setLatLng([currentWorkerLat, currentWorkerLng]);

      // Update worker marker HTML with live remaining distance
      const updatedWorkerIcon = L.divIcon({
        className: 'custom-worker-pin',
        html: `
          <div class="relative flex items-center justify-center">
            <span class="absolute -inset-3 rounded-full bg-emerald-500/35 animate-pulse"></span>
            <div class="w-12 h-12 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-2xl overflow-hidden">
              <img src="${job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'}" class="w-full h-full object-cover" alt="Usta" />
            </div>
            <div class="absolute -top-3 -right-2 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black border-2 border-white shadow">
              🚗 ${currentSpeedKmh} km/s
            </div>
            <div class="absolute -bottom-6 px-2 py-0.5 bg-emerald-800 text-white text-[10px] font-bold rounded-md shadow whitespace-nowrap border border-emerald-400">
              ${job.workerName?.split(' ')[0] || 'Usta'} · ${remainingDistanceDisplay}
            </div>
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });
      workerMarkerRef.current.setIcon(updatedWorkerIcon);

      if (polylineRef.current) {
        polylineRef.current.setLatLngs([
          [currentWorkerLat, currentWorkerLng],
          [destLat, destLng]
        ]);
      }

      if (completedPolylineRef.current) {
        completedPolylineRef.current.setLatLngs([
          [originLat, originLng],
          [currentWorkerLat, currentWorkerLng]
        ]);
      }
    }
  }, [currentWorkerLat, currentWorkerLng, destLat, destLng, originLat, originLng, remainingDistanceDisplay, currentSpeedKmh, job.workerAvatar, job.workerName]);

  // Resize map when expanded/collapsed
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 150);
    }
  }, [isExpandedMap]);

  // Heatmap Layer Effect for Samarkand active job requests
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (showHeatmap) {
      if (!heatLayerRef.current) {
        try {
          const heat = (L as any).heatLayer(heatmapData, {
            radius: 35,
            blur: 22,
            maxZoom: 16,
            max: 1.0,
            minOpacity: 0.38,
            gradient: {
              0.2: '#2563eb', // ko'k (past talab)
              0.4: '#059669', // yashil
              0.6: '#eab308', // sariq (o'rtacha talab)
              0.8: '#f97316', // to'q sariq (yuqori talab)
              1.0: '#dc2626'  // qizil (eng yuqori qaynoq talab!)
            }
          });
          heat.addTo(mapInstanceRef.current);
          heatLayerRef.current = heat;
        } catch (err) {
          console.warn("Heatmap yuklashda xato:", err);
        }
      }

      // Add clickable hotspot pulse badges and glowing circles on the map
      if (!hotspotMarkersRef.current && mapInstanceRef.current) {
        const markersGroup = L.layerGroup();
        SAMARKAND_HOTSPOTS.forEach(spot => {
          // Heat halo circle
          const circleColor = spot.activeOrders >= 10 ? '#dc2626' : spot.activeOrders >= 7 ? '#f97316' : '#eab308';
          const heatCircle = L.circle([spot.lat, spot.lng], {
            radius: 320,
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.18,
            weight: 1.5,
            dashArray: '3, 3'
          });
          markersGroup.addLayer(heatCircle);

          const flameIcon = L.divIcon({
            className: 'custom-heat-hotspot',
            html: `
              <div class="relative flex items-center justify-center cursor-pointer pointer-events-auto">
                <span class="absolute -inset-1.5 rounded-full ${spot.activeOrders >= 10 ? 'bg-red-500/50' : 'bg-amber-500/40'} animate-ping"></span>
                <div class="px-2 py-0.5 rounded-full bg-stone-900/95 text-amber-400 border ${spot.activeOrders >= 10 ? 'border-red-500' : 'border-amber-400/80'} shadow-lg flex items-center gap-1 text-[10px] font-bold whitespace-nowrap">
                  <span>🔥 ${spot.name.split('/')[0].trim()}</span>
                  <span class="${spot.activeOrders >= 10 ? 'bg-red-600' : 'bg-amber-500'} text-white px-1.5 py-0.1 rounded text-[9px] font-black">${spot.activeOrders}</span>
                </div>
              </div>
            `,
            iconSize: [90, 24],
            iconAnchor: [45, 12]
          });

          const m = L.marker([spot.lat, spot.lng], { icon: flameIcon })
            .bindPopup(`
              <div style="font-family: sans-serif; font-size: 12px; padding: 2px;">
                <div style="font-weight: bold; color: #1c1917; margin-bottom: 2px;">${spot.name}</div>
                <div style="color: #059669; font-weight: 600;">Faol talab: ${spot.activeOrders} ta buyurtma</div>
                <div style="color: #d97706; font-size: 11px; margin-top: 2px;">Top kasblar: ${spot.topCategory}</div>
              </div>
            `);
          markersGroup.addLayer(m);
        });
        markersGroup.addTo(mapInstanceRef.current);
        hotspotMarkersRef.current = markersGroup;
      }
    } else {
      if (heatLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }
      if (hotspotMarkersRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(hotspotMarkersRef.current);
        hotspotMarkersRef.current = null;
      }
    }
  }, [showHeatmap, heatmapData]);

  // Simulation tick
  useEffect(() => {
    if (!isSimulating || progress >= 1 || realGpsActive) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = 0.015 * simulationSpeed;
        const next = Math.min(1, prev + step);
        if (next >= 1) {
          setIsSimulating(false);
          setCustomStatus('arrived');
          onUpdateJobStatus(job.id, 'arrived');
          if (!audioPlayedForArrival) {
            setAudioPlayedForArrival(true);
            playNotificationSound();
          }
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }
        return next;
      });
      // Vary speed realistically between 24 and 36 km/h in Samarkand streets
      setCurrentSpeedKmh(Math.floor(25 + Math.random() * 11));
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulating, progress, simulationSpeed, job.id, onUpdateJobStatus, realGpsActive, audioPlayedForArrival]);

  // Real Device GPS Geolocation with watchPosition
  const handleToggleRealGps = () => {
    if (!navigator.geolocation) {
      alert("Qurilmangizda GPS (geolokatsiya) qo'llab-quvvatlanmaydi.");
      return;
    }

    if (!realGpsActive) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const userLat = pos.coords.latitude;
          const userLng = pos.coords.longitude;

          // Check if coordinate is in Samarkand province (39.1 to 40.2 lat, 66.2 to 67.5 lng)
          const isInsideSamarkand = userLat >= 39.1 && userLat <= 40.2 && userLng >= 66.2 && userLng <= 67.5;
          let effectiveLat = userLat;
          let effectiveLng = userLng;

          if (!isInsideSamarkand) {
            // Gracefully snap to Samarkand center/Sug'diyona so map never deviates from Samarkand
            effectiveLat = 39.6720;
            effectiveLng = 66.9380;
          }

          setRealGpsActive(true);
          setIsSimulating(false);
          const accuracy = Math.round(pos.coords.accuracy || 15);
          setGpsAccuracyMeters(accuracy);

          if (pos.coords.speed !== null && pos.coords.speed !== undefined) {
            setCurrentSpeedKmh(Math.max(15, Math.round(pos.coords.speed * 3.6)));
          }

          setRealWorkerCoords({ lat: effectiveLat, lng: effectiveLng });

          if (mapInstanceRef.current) {
            // Draw or update accuracy circle
            if (accuracyCircleRef.current) {
              accuracyCircleRef.current.setLatLng([effectiveLat, effectiveLng]);
              accuracyCircleRef.current.setRadius(accuracy);
            } else {
              accuracyCircleRef.current = L.circle([effectiveLat, effectiveLng], {
                radius: accuracy,
                color: '#10b981',
                fillColor: '#34d399',
                fillOpacity: 0.2,
                weight: 1
              }).addTo(mapInstanceRef.current);
            }

            mapInstanceRef.current.setView([effectiveLat, effectiveLng], 15);
          }
        },
        (err) => {
          console.warn("GPS ruxsati berilmadi:", err);
          alert("GPS ruxsatini yoqing. Brauzer sozlamalaridan joylashuvga ruxsat bering.");
          setRealGpsActive(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 10000
        }
      );
      watchIdRef.current = watchId;
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (accuracyCircleRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(accuracyCircleRef.current);
        accuracyCircleRef.current = null;
      }
      setRealGpsActive(false);
      setRealWorkerCoords(null);
      setGpsAccuracyMeters(null);
      setIsSimulating(true);
    }
  };

  // Center both worker and destination in map view (strictly Samarkand route)
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    const bounds = L.latLngBounds([
      [originLat, originLng],
      [destLat, destLng]
    ]);
    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  };

  // Fly directly to Samarkand Registan Center
  const handleRecenterSamarkand = () => {
    if (!mapInstanceRef.current) return;
    setActiveHotspotFilter(null);
    mapInstanceRef.current.flyTo([39.6542, 66.9597], 13.5, { duration: 1.2 });
  };

  // Pan to specific Samarkand demand hotspot
  const handlePanToHotspot = (lat: number, lng: number, spotName: string) => {
    if (!mapInstanceRef.current) return;
    setActiveHotspotFilter(spotName);
    mapInstanceRef.current.flyTo([lat, lng], 14.5, { duration: 1.2 });
  };

  const handleSendQuickMessage = (msg: string) => {
    setQuickMessageSent(msg);
    if (onSendMessage) {
      onSendMessage(job.id, msg, currentRole);
    }
    setTimeout(() => setQuickMessageSent(null), 3500);
  };

  const handleSendInlineMessage = (textToSend?: string) => {
    const text = (textToSend || chatMessageText).trim();
    if (!text) return;
    if (onSendMessage) {
      onSendMessage(job.id, text, currentRole);
    }
    setChatMessageText('');
    setTimeout(() => {
      chatScrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleMarkArrived = () => {
    setProgress(1);
    setIsSimulating(false);
    setCustomStatus('arrived');
    onUpdateJobStatus(job.id, 'arrived');
    playNotificationSound('order');
    speakUzbek(`${job.workerName || 'Usta'} manzilga yetib keldi!`);
    confetti({ particleCount: 80, spread: 70 });
  };

  const handleStartWork = () => {
    setCustomStatus('in_progress');
    onUpdateJobStatus(job.id, 'in_progress');
  };

  const handleCompleteWork = () => {
    if (onOpenCompleteModal) {
      onOpenCompleteModal(job);
    } else {
      setCustomStatus('completed');
      onUpdateJobStatus(job.id, 'completed');
      confetti({ particleCount: 120, spread: 80 });
      if (onRequestReview) {
        setTimeout(() => {
          onRequestReview({ ...job, status: 'completed' });
        }, 600);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/85 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className={`relative w-full ${isExpandedMap ? 'max-w-6xl' : 'max-w-4xl'} bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[96vh] transition-all duration-300`}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-stone-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400"></span>
              <span className="absolute w-6 h-6 rounded-full bg-emerald-400/40 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display font-bold text-base sm:text-lg text-white">
                  Real Vaqtda GPS-Kuzatuv & Radar
                </h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  JONLI EFIR
                </span>
                {realGpsActive && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-300 border border-blue-700/60">
                    🛰️ TELEFON GPSi ULANGAN ({gpsAccuracyMeters ? `±${gpsAccuracyMeters}m` : ''})
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-300 truncate max-w-xs sm:max-w-md">
                {job.title} · <span className="text-amber-300">{job.locationAddress}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Live Chat drawer toggle button */}
            <button
              onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isChatDrawerOpen 
                  ? 'bg-amber-400 text-stone-950 ring-2 ring-amber-300' 
                  : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700'
              }`}
              title="Usta bilan to'g'ridan-to'g'ri xabar almashish (Chat)"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Chat</span>
              {job.chatMessages && job.chatMessages.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-stone-950 font-black">
                  {job.chatMessages.length}
                </span>
              )}
            </button>

            {/* Share Live Location button to send tracking map via clipboard to third parties */}
            <button
              onClick={handleShareLiveLocation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                shareCopied 
                  ? 'bg-emerald-500 text-stone-950 scale-105 ring-2 ring-emerald-300' 
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 active:scale-95'
              }`}
              title="Kuzatuv xaritasi havolasini clipboardga nusxalash va uchinchi shaxslarga yuborish"
            >
              {shareCopied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                  <span>Havola nusxalandi! ✓</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share Live Location</span>
                  <span className="sm:hidden">Ulashish</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsExpandedMap(!isExpandedMap)}
              className="hidden sm:flex w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white items-center justify-center transition-colors"
              title={isExpandedMap ? "Kichiklashtirish" : "Kengaytirilgan xarita"}
            >
              {isExpandedMap ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Yopish"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Share Live Location Alert / Toast Banner */}
        {shareNotificationMessage && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 shadow-md shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200 shrink-0" />
              <span>{shareNotificationMessage}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const url = `${window.location.origin}${window.location.pathname}?trackJob=${job.id}&live=1`;
                  window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(`HalolMehnat.uz jonli xaritasi: ${job.title}`)}`, '_blank');
                }}
                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 rounded text-[11px] font-semibold text-white transition-colors"
              >
                Telegramda yuborish
              </button>
              <button 
                onClick={() => setShareNotificationMessage(null)}
                className="text-emerald-100 hover:text-white p-1"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Proximity & Arrival Live Alert Banners */}
        {(customStatus === 'arrived' || progress >= 1) ? (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 shadow-md shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
              <span>📍 USTA MANZILGA YETIB KELDI! Usta sizning darvoza yoki ko'cha oldida kutmoqda.</span>
            </div>
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="px-2.5 py-1 bg-white text-emerald-950 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors shrink-0 shadow-2xs"
            >
              Xabar yozish 💬
            </button>
          </div>
        ) : (rawRemainingKm > 0 && rawRemainingKm <= 0.8) ? (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-stone-950 px-4 py-2.5 text-xs font-bold flex items-center justify-between gap-2 shadow-md shrink-0 animate-pulse">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-stone-950 shrink-0" />
              <span>⚡ DIQQAT: Usta ish joyiga juda yaqinlashmoqda! Qolgan masofa: {remainingDistanceDisplay} (~{estimatedMinutesLeft} daqiqa). Kutib olishga tayyorlaning!</span>
            </div>
            <button
              onClick={() => setIsChatDrawerOpen(true)}
              className="px-2.5 py-1 bg-stone-950 text-amber-300 rounded-lg text-xs font-bold hover:bg-stone-900 transition-colors shrink-0 shadow-2xs"
            >
              Darhol xabar yozish 💬
            </button>
          </div>
        ) : null}

        {/* Inline Live Chat Drawer for instantaneous communication with Worker */}
        {isChatDrawerOpen && (
          <div className="bg-white border-b-2 border-amber-300 p-4 space-y-3 shrink-0 shadow-lg animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <img 
                    src={job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'} 
                    alt="Usta" 
                    className="w-8 h-8 rounded-full object-cover border border-amber-400"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <div className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                    <span>{job.workerName || "Usta"} bilan jonli muloqot</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">Online</span>
                  </div>
                  <div className="text-[10px] text-stone-500">Xaritani yopmasdan to'g'ridan-to'g'ri xabar yuboring</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {onOpenChat && (
                  <button
                    onClick={() => onOpenChat(job)}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
                    title="To'liq ekranda chatni ochish"
                  >
                    <span>To'liq ekran</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsChatDrawerOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
                  aria-label="Yopish"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Recent Messages Area (compact scrollable) */}
            <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-stone-50 rounded-xl border border-stone-200 text-xs">
              {(!job.chatMessages || job.chatMessages.length === 0) ? (
                <div className="py-4 text-center text-stone-400 text-xs italic">
                  Hozircha xabarlar yo'q. Birinchi bo'lib xabar yozing yoki quyidagi tezkor tugmalardan birini bosing!
                </div>
              ) : (
                job.chatMessages.map((msg) => {
                  const isMe = msg.senderRole === currentRole;
                  return (
                    <div key={msg.id} className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-2.5 rounded-xl ${
                        isMe ? 'bg-amber-500 text-stone-950 font-medium rounded-br-xs' : 'bg-white text-stone-900 border border-stone-200 rounded-bl-xs'
                      }`}>
                        <div className="text-[9px] font-semibold text-stone-500 mb-0.5">{isMe ? "Siz" : msg.senderName}</div>
                        <p className="break-words leading-relaxed">{msg.text}</p>
                        <div className="text-[9px] text-stone-500 mt-1 text-right">{msg.timestamp}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatScrollRef} />
            </div>

            {/* Quick Prompts */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0">Tezkor:</span>
              {(currentRole === 'employer' ? [
                "Darvoza oldidaman, ochiq",
                "Qayerdasiz? 5 daqiqada yetasizmi?",
                "Manzilni topdingizmi?",
                "Kelishingizga choy tayyor",
                "Yetib kelgach telefon qiling"
              ] : [
                "Assalomu alaykum! Yo'ldaman",
                "Taxminan 5-10 daqiqada yetaman",
                "Manzilga yetib keldim 📍",
                "Asboblarim tayyor",
                "Darvoza oldidaman"
              ]).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendInlineMessage(prompt)}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-stone-800 rounded-lg border border-stone-200 hover:border-amber-300 font-medium whitespace-nowrap transition-colors shrink-0 shadow-2xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatMessageText}
                onChange={(e) => setChatMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendInlineMessage();
                  }
                }}
                placeholder="Xabar yozing (masalan: darvoza oldidaman)..."
                className="flex-1 px-3.5 py-2 bg-stone-100 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
              />
              <button
                onClick={() => handleSendInlineMessage()}
                disabled={!chatMessageText.trim()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-200 text-stone-950 disabled:text-stone-400 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Yuborish</span>
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY DISTANCE & TELEMETRY BANNER (Crucial User Requirement) */}
        <div className="bg-amber-500/10 border-b border-amber-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-stone-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600">
                Ish beruvchigacha qolgan aniq masofa:
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black font-mono text-emerald-800 tabular-nums">
                  {remainingDistanceDisplay}
                </span>
                {remainingMetersDetailed > 0 && remainingMetersDetailed < 10000 && (
                  <span className="text-xs font-semibold text-stone-600">
                    ({remainingMetersDetailed.toLocaleString()} metr)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 divide-x divide-stone-200">
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-stone-500">Taxminiy kelish (ETA)</div>
              <div className="text-base sm:text-lg font-black font-mono text-stone-900 tabular-nums">
                {progress >= 1 ? '0 daqiqa (Yetib keldi)' : `${estimatedMinutesLeft} daqiqa`}
              </div>
            </div>

            <div className="pl-3 sm:pl-4 text-right">
              <div className="text-[10px] uppercase font-bold text-stone-500">Harakat tezligi</div>
              <div className="text-base sm:text-lg font-black font-mono text-stone-900 tabular-nums">
                {progress >= 1 ? '0 km/s' : `${currentSpeedKmh} km/s`}
              </div>
            </div>
          </div>
        </div>

        {/* Samarkand City & Region Location Anchor */}
        <div className="bg-stone-900 text-stone-200 px-4 py-2 text-xs flex items-center justify-between border-t border-stone-800 shrink-0">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Xarita hududi: </span>
              <span className="text-amber-300 font-semibold">Samarqand shahri va viloyati</span>
              <span className="text-stone-400 text-[11px] ml-1.5 hidden md:inline">
                (Registon, Sug'diyona, Siyob bozori, Motrid, Temiryo'l vokzali, Urgut, Toyloq)
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Samarqand xaritasi faol
            </span>
          </div>
        </div>

        {/* Map & Live Radar Canvas */}
        <div className={`relative ${isExpandedMap ? 'h-96 sm:h-[460px]' : 'h-72 sm:h-88'} w-full bg-stone-100 shrink-0 transition-all duration-300`}>
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Floating Radar Status Overlay on Map */}
          <div className="absolute top-3 left-3 z-20 bg-stone-900/90 backdrop-blur-md text-white p-3 rounded-xl border border-stone-700/70 shadow-xl text-xs max-w-xs pointer-events-auto">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-bold text-emerald-300">
                {progress >= 1 ? 'Usta manzilga yetib keldi!' : "Usta yo'nalish bo'ylab kelmoqda"}
              </span>
            </div>
            <div className="text-[11px] text-stone-300 truncate">
              {job.workerName || 'Usta'} · {job.locationAddress}
            </div>
            <div className="mt-1 pt-1 border-t border-stone-700/80 flex items-center justify-between text-[10px] text-amber-300">
              <span>Masofa: <b>{remainingDistanceDisplay}</b></span>
              <span>Vaqt: <b>~{estimatedMinutesLeft} daq</b></span>
            </div>
          </div>

          {/* Map action controls: Heatmap Toggle, Fit Bounds & Center on Samarkand */}
          <div className="absolute top-3 right-12 z-20 flex flex-col gap-1.5 pointer-events-auto">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`p-2 rounded-lg text-xs font-bold shadow-md border flex items-center gap-1.5 backdrop-blur-md transition-all ${
                showHeatmap 
                  ? 'bg-red-600 text-white border-red-500 shadow-red-500/25' 
                  : 'bg-white/95 text-stone-800 border-stone-200 hover:bg-stone-100'
              }`}
              title="Samarqand talab issiqlik qatlami (Heatmap)"
            >
              <Flame className={`w-4 h-4 ${showHeatmap ? 'text-amber-300 animate-pulse' : 'text-stone-500'}`} />
              <span className="hidden sm:inline">{showHeatmap ? "🔥 Heatmap: FAOL" : "Heatmap: O'chiq"}</span>
            </button>

            <button
              onClick={handleRecenterSamarkand}
              className="p-2 rounded-lg bg-white/95 text-stone-800 hover:bg-stone-100 shadow-md border border-stone-200 text-xs font-semibold flex items-center gap-1 backdrop-blur-xs transition-colors"
              title="Samarqand markaziga (Registon) qaytish"
            >
              <MapPin className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">Samarqand markazi</span>
            </button>

            <button
              onClick={handleFitBounds}
              className="p-2 rounded-lg bg-white/95 text-stone-800 hover:bg-stone-100 shadow-md border border-stone-200 text-xs font-semibold flex items-center gap-1 backdrop-blur-xs transition-colors"
              title="Marshrutni to'liq ko'rish"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Marshrut</span>
            </button>
          </div>

          {/* Live Speedometer & Distance badge at bottom */}
          <div className="absolute bottom-3 left-3 sm:left-auto sm:right-3 z-20 bg-white/95 backdrop-blur-md rounded-xl p-2.5 shadow-xl border border-stone-200 flex items-center gap-3 text-stone-800 text-xs pointer-events-auto">
            <div className="flex items-center gap-1.5 border-r border-stone-200 pr-3">
              <Gauge className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-[9px] text-stone-500 uppercase font-bold">Tezlik</div>
                <div className="text-xs font-bold font-mono tabular-nums">{currentSpeedKmh} km/s</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 border-r border-stone-200 pr-3">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="text-[9px] text-stone-500 uppercase font-bold">Qoldi</div>
                <div className="text-xs font-bold font-mono tabular-nums text-emerald-700">{remainingDistanceDisplay}</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-[9px] text-stone-500 uppercase font-bold">Kelish vaqti</div>
                <div className="text-xs font-bold font-mono tabular-nums text-blue-700">
                  {progress >= 1 ? 'Yetib keldi' : `~${estimatedMinutesLeft} daq`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap Demand Zones & Intensity Legend Strip */}
        {showHeatmap && (
          <div className="bg-stone-900 text-white px-4 py-3 border-b border-stone-800 space-y-2.5 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300">
                  Samarqand bo'yicha eng yuqori talab zonalari (Issiqlik tahlili):
                </span>
              </div>

              {/* Legend gradient indicator */}
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-stone-400">Talab darajasi:</span>
                <div className="flex items-center gap-1 font-semibold">
                  <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white">Kam</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white">O'rta</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-stone-950">Faol</span>
                  <span className="px-1.5 py-0.5 rounded bg-red-600 text-white font-bold animate-pulse">Qaynoq (10+)</span>
                </div>
              </div>
            </div>

            {/* Clickable Samarkand Hotspot Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              <span className="text-stone-400 text-[10px] shrink-0 font-bold uppercase tracking-wider">
                Hududni ko'rish:
              </span>
              {SAMARKAND_HOTSPOTS.map((spot) => (
                <button
                  key={spot.id}
                  onClick={() => handlePanToHotspot(spot.lat, spot.lng, spot.name)}
                  className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 font-medium transition-all ${
                    activeHotspotFilter === spot.name
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md scale-105'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700'
                  }`}
                  title={`${spot.name}: ${spot.activeOrders} ta faol buyurtma (${spot.topCategory})`}
                >
                  <span>🔥 {spot.name.split('/')[0].trim()}</span>
                  <span className="px-1.5 py-0.2 bg-red-600 text-white rounded text-[10px] font-black">
                    {spot.activeOrders}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Body & Interaction Zone */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Worker Profile Strip with direct contact */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-stone-50 border border-stone-200 rounded-xl">
            <div className="flex items-center gap-3.5">
              <img 
                src={job.workerAvatar || '/src/assets/images/master_craftsman_portrait_1791274865042.jpg'} 
                alt={job.workerName || 'Ishchi'} 
                className="w-13 h-13 rounded-full object-cover border-2 border-amber-400 shadow-sm"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-stone-900 text-base">{job.workerName || 'Usta Bahrom'}</h4>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    ★ {job.workerRating || 4.9}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    🚗 Yo'lda
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  {job.workerRole || "Bino & Devor ustasi"} · {job.district || 'Samarqand'}
                </p>
                <div className="text-xs font-medium text-stone-700 mt-0.5 flex items-center gap-2">
                  <span>To'lov: <b className="font-mono">{job.budgetUzs.toLocaleString()} so'm</b></span>
                  <span>·</span>
                  <span className="text-emerald-700">20,000 so'm kafolat to'langan ✓</span>
                </div>
              </div>
            </div>

            {/* Direct Call & Message Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a 
                href={`tel:${job.workerPhone || '+998901234567'}`}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Qo'ng'iroq qilish</span>
              </a>

              <button 
                onClick={() => setIsChatDrawerOpen(!isChatDrawerOpen)}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
                title="Muloqot / Xabar yozish (Chat)"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Xabar yozish (Chat)</span>
                {job.chatMessages && job.chatMessages.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-950 text-amber-300 font-mono">
                    {job.chatMessages.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {quickMessageSent && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Ustaga SMS jo'natildi: "{quickMessageSent}"</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-mono">Yetkazildi</span>
            </div>
          )}

          {/* Interactive Route Milestones & Progress */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <div className="font-bold text-stone-800 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Marshrut progressi: Samarqand ko'chalari</span>
              </div>
              <div className="font-mono tabular-nums font-black text-emerald-700 text-sm">
                {Math.round(progress * 100)}% bajarildi
              </div>
            </div>

            <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-700 rounded-full" 
                style={{ width: `${progress * 100}%` }}
              />
            </div>

            {/* Checkpoint Steps */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="p-2 bg-white rounded-lg border border-stone-200">
                <div className="font-bold text-stone-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Boshlang'ich joy
                </div>
                <div className="text-stone-500 text-[10px] truncate">Registon / Usta bazasi</div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-emerald-300 bg-emerald-50/50">
                <div className="font-bold text-emerald-900 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Yo'lda harakat
                </div>
                <div className="text-emerald-700 text-[10px] font-mono font-bold truncate">
                  {remainingDistanceDisplay}
                </div>
              </div>

              <div className="p-2 bg-white rounded-lg border border-stone-200">
                <div className="font-bold text-stone-800 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Buyurtmachi
                </div>
                <div className="text-stone-500 text-[10px] truncate">{job.locationAddress}</div>
              </div>
            </div>
          </div>

          {/* GPS Simulation & Real Geolocation Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-stone-100/80 rounded-xl border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-600 font-semibold">Simulyatsiya tezligi:</span>
              <button 
                onClick={() => setSimulationSpeed(1)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${simulationSpeed === 1 ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 border border-stone-300'}`}
              >
                1x
              </button>
              <button 
                onClick={() => setSimulationSpeed(2)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${simulationSpeed === 2 ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 border border-stone-300'}`}
              >
                2x
              </button>
              <button 
                onClick={() => setSimulationSpeed(4)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${simulationSpeed === 4 ? 'bg-stone-900 text-white' : 'bg-white text-stone-700 border border-stone-300'}`}
              >
                4x (Tez)
              </button>

              <button
                onClick={() => setIsSimulating(!isSimulating)}
                className="px-2.5 py-1 rounded-md bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 font-medium flex items-center gap-1"
                title={isSimulating ? "To'xtatish" : "Davom ettirish"}
              >
                {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSimulating ? "Pauza" : "Start"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleToggleRealGps}
                className={`px-3 py-1.5 rounded-lg font-bold border flex items-center gap-1.5 transition-colors ${
                  realGpsActive 
                    ? 'bg-blue-600 text-white border-blue-700 shadow-sm' 
                    : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-50 shadow-2xs'
                }`}
                title="Haqiqiy telefon GPSini xaritaga ulash"
              >
                <Radio className={`w-3.5 h-3.5 ${realGpsActive ? 'animate-pulse' : ''}`} />
                <span>{realGpsActive ? 'Jonli telefon GPSi faol' : 'Telefon GPSini ulash'}</span>
              </button>

              <button 
                onClick={() => { setProgress(0.1); setIsSimulating(true); setAudioPlayedForArrival(false); setAudioPlayedForProximity(false); }}
                className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-md transition-colors"
                title="Kuzatuvni boshidan qayta boshlash"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Job State Actions: Yetib keldi -> Ish boshlandi -> Ish yakunlandi */}
          <div className="pt-2 border-t border-stone-200">
            <div className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wider">
              Buyurtma bosqichlari & Boshqaruv
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {customStatus === 'en_route' && (
                <button 
                  onClick={handleMarkArrived}
                  className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Yetib keldi deb belgilash</span>
                </button>
              )}

              {customStatus === 'arrived' && (
                <button 
                  onClick={handleStartWork}
                  className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <HardHat className="w-4 h-4" />
                  <span>Ishni boshlash (Bajarilmoqda)</span>
                </button>
              )}

              {customStatus === 'in_progress' && (
                <button 
                  onClick={handleCompleteWork}
                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Ishni yakunlash & To'lov</span>
                </button>
              )}

              {customStatus === 'completed' && (
                <div className="col-span-full space-y-2">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <div className="font-bold">Ish muvaffaqiyatli yakunlandi!</div>
                        <div>Usta haqini oldi, platformaga 20,000 so'm komissiya o'tkazildi.</div>
                      </div>
                    </div>
                    <span className="font-mono tabular-nums font-bold text-sm bg-emerald-100 text-emerald-900 px-2 py-1 rounded">
                      +20 000 UZS
                    </span>
                  </div>

                  {job.reviewLeft ? (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="flex text-amber-500 font-bold">★ {job.ratingGiven}</span>
                        <span className="italic text-stone-600 truncate max-w-xs">"{job.reviewComment}"</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Baholandi ✓
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onRequestReview?.(job)}
                      className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-colors"
                    >
                      <Star className="w-4 h-4 fill-stone-950" />
                      <span>Usta uchun 1-5 yulduzli baho va sharh qoldirish</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
