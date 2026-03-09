"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { supabase } from "../lib/supabase";

// Fix missing marker icons in leaflet with Next.js
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = defaultIcon;

// Custom colored icons
const crimeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const permitIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const facilityIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

interface MapProps {
    address: string;
    externalCoordinates?: [number, number];
}

// Simple Euclidean approximation distance in KM as requested
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111;
}

const PROXIMITY_RADIUS_KM = 10;

// Component to recenter map when location changes
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, 14, { animate: true });
    }, [center, map]);
    return null;
}

export default function Map({ address, externalCoordinates }: MapProps) {
    const defaultCenter: [number, number] = externalCoordinates || [32.3792, -86.3077];
    const [center, setCenter] = useState<[number, number]>(defaultCenter); // Montgomery default
    const [loading, setLoading] = useState(true);
    const [activeLayers, setActiveLayers] = useState({ crime: true, permits: true, facilities: true });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [markers, setMarkers] = useState<any[]>([]);
    const [crimeCount, setCrimeCount] = useState(0);

    // Map theme switching
    const [mapTheme, setMapTheme] = useState<"dark" | "light">("dark");
    useEffect(() => {
        const updateTheme = () => {
            const isLight = document.documentElement.classList.contains("light");
            setMapTheme(isLight ? "light" : "dark");
        };

        updateTheme();
        const observer = new MutationObserver(updateTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Geocode the address
                let targetLat = 32.3792;
                let targetLng = -86.3077;

                if (externalCoordinates) {
                    targetLat = externalCoordinates[0];
                    targetLng = externalCoordinates[1];
                    setCenter([targetLat, targetLng]);
                } else {
                    const query = encodeURIComponent(`${address}, Montgomery, AL`);
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`);
                    const data = await res.json();

                    if (data && data.length > 0) {
                        targetLat = parseFloat(data[0].lat);
                        targetLng = parseFloat(data[0].lon);
                        setCenter([targetLat, targetLng]);
                    }
                }

                // 2. Fetch crime data from Supabase
                const newMarkers: { type: string; lat: number; lng: number; desc: string; neighborhood?: string }[] = [];

                const { data: crimes } = await supabase
                    .from('crime_incidents')
                    .select('*');

                if (crimes) {
                    // Filter by proximity to searched address (10km)
                    const nearbyCrimes = crimes.filter(c =>
                        distanceKm(targetLat, targetLng, c.lat, c.lng) <= PROXIMITY_RADIUS_KM
                    );
                    setCrimeCount(nearbyCrimes.length);

                    nearbyCrimes.forEach(c => newMarkers.push({
                        type: 'crime',
                        lat: c.lat,
                        lng: c.lng,
                        desc: `${c.type}: ${c.description || 'Reported Incident'}`,
                        neighborhood: c.neighborhood,
                    }));
                }

                // 3. Fetch permits from Supabase
                const { data: permits } = await supabase.from('permits').select('*');
                if (permits) {
                    const nearbyPermits = permits.filter(p =>
                        distanceKm(targetLat, targetLng, p.lat, p.lng) <= PROXIMITY_RADIUS_KM
                    );
                    nearbyPermits.forEach(p => newMarkers.push({
                        type: 'permit', lat: p.lat, lng: p.lng, desc: `${p.type} (${p.status})`
                    }));
                }

                // 4. Static facilities for context
                newMarkers.push({ type: 'facility', lat: 32.3720, lng: -86.3050, desc: 'Fire Station #1' });
                newMarkers.push({ type: 'facility', lat: 32.3650, lng: -86.3120, desc: 'Police Precinct' });
                newMarkers.push({ type: 'facility', lat: 32.3800, lng: -86.2990, desc: 'City Hall' });

                setMarkers(newMarkers);

            } catch (e) {
                console.error("Map data fetch failed", e);
            } finally {
                setLoading(false);
            }
        };
        if (address) fetchData();
    }, [address]);

    return (
        <div className="w-full premium-glass rounded-3xl p-4 md:p-6 overflow-hidden flex flex-col h-full gap-4 shadow-3d-soft hover:shadow-3d-heavy transition-all duration-500">
            {/* Toggles */}
            <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="text-foreground font-bold mr-2">Map Layers</div>
                <button
                    onClick={() => setActiveLayers(prev => ({ ...prev, crime: !prev.crime }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 hover-3d-lift ${activeLayers.crime ? 'bg-red-500/20 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'bg-black/10 shadow-inner border-white/5 text-text-secondary hover:bg-black/20'
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-red-500" /> Crime
                    {crimeCount > 0 && activeLayers.crime && (
                        <span className="ml-1 text-[10px] bg-red-500/30 px-1.5 py-0.5 rounded-full">{crimeCount}</span>
                    )}
                </button>
                <button
                    onClick={() => setActiveLayers(prev => ({ ...prev, permits: !prev.permits }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 hover-3d-lift ${activeLayers.permits ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-600 dark:text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'bg-black/10 shadow-inner border-white/5 text-text-secondary hover:bg-black/20'
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-yellow-500" /> Permits
                </button>
                <button
                    onClick={() => setActiveLayers(prev => ({ ...prev, facilities: !prev.facilities }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 hover-3d-lift ${activeLayers.facilities ? 'bg-blue-500/20 border-blue-500/50 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : 'bg-black/10 shadow-inner border-white/5 text-text-secondary hover:bg-black/20'
                        }`}
                >
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Facilities
                </button>
            </div>

            {/* Map Container */}
            <div className="w-full h-[400px] md:h-full min-h-[400px] rounded-3xl overflow-hidden relative z-0 shadow-inner border border-white/10">

                {/* Legend Overlay */}
                <div className="absolute bottom-4 right-4 z-[400] premium-glass rounded-2xl p-4 shadow-3d-soft flex flex-col gap-3">
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 px-1">Legend</div>
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm border border-red-600/20" /> Crime Incident
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-sm border border-yellow-600/20" /> Active Permit
                    </div>
                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm border border-blue-600/20" /> City Facility
                    </div>
                </div>

                {loading && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                )}
                <MapContainer
                    center={center}
                    zoom={14}
                    scrollWheelZoom={false}
                    style={{ height: '100%', width: '100%', background: 'var(--card)' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                        url={`https://{s}.basemaps.cartocdn.com/${mapTheme === "light" ? "light_all" : "dark_all"}/{z}/{x}/{y}{r}.png`}
                    />
                    <MapUpdater center={center} />

                    {/* Proximity radius circle (10km converted to meters for leaflet) */}
                    <Circle
                        center={center}
                        radius={PROXIMITY_RADIUS_KM * 1000}
                        pathOptions={{
                            color: '#22c55e',
                            fillColor: '#22c55e',
                            fillOpacity: 0.04,
                            weight: 1,
                            dashArray: '6 4',
                        }}
                    />

                    {markers.map((m, i) => {
                        const show = (m.type === 'crime' && activeLayers.crime) ||
                            (m.type === 'permit' && activeLayers.permits) ||
                            (m.type === 'facility' && activeLayers.facilities);
                        if (!show) return null;

                        const icon = m.type === 'crime' ? crimeIcon : m.type === 'permit' ? permitIcon : facilityIcon;

                        return (
                            <Marker key={i} position={[m.lat, m.lng]} icon={icon}>
                                <Popup className={`custom-popup`}>
                                    <div className="flex items-start gap-2 min-w-[180px]">
                                        <div className="mt-1">
                                            {m.type === 'crime' && <span className="w-2.5 h-2.5 rounded-full bg-red-500 block shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                                            {m.type === 'permit' && <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 block shadow-[0_0_8px_rgba(234,179,8,0.6)]" />}
                                            {m.type === 'facility' && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 block shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
                                        </div>
                                        <div>
                                            <div className="font-bold text-foreground text-sm uppercase tracking-wide opacity-90 mb-0.5">
                                                {m.type}
                                            </div>
                                            <div className="font-medium text-foreground text-[13px] leading-tight text-pretty mb-1">
                                                {m.desc}
                                            </div>
                                            {m.neighborhood && (
                                                <div className="text-text-secondary text-[11px] font-medium flex items-center gap-1">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                                    {m.neighborhood}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}
