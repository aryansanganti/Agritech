/// <reference types="vite/client" />
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons (they break in Vite builds)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored markers
const createColoredIcon = (color: string) => {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            transform: translate(-12px, -12px);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
};

interface SatelliteMapProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{ lat: number; lng: number; title?: string; score?: number }>;
    onMarkerClick?: (marker: { lat: number; lng: number; title?: string }) => void;
    variant?: 'satellite' | 'standard' | 'dark';
}

// Component to handle map center changes
const MapController: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        map.setView([center.lat, center.lng], zoom);
    }, [center.lat, center.lng, zoom, map]);

    return null;
};

export const SatelliteMap: React.FC<SatelliteMapProps> = ({
    center,
    zoom = 10,
    markers = [],
    onMarkerClick,
    variant = 'satellite'
}) => {
    // Select tile layer based on variant
    const getTileLayer = () => {
        switch (variant) {
            case 'standard':
                return {
                    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                };
            case 'dark':
                return {
                    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                };
            case 'satellite':
            default:
                return {
                    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                    attribution: '&copy; <a href="https://www.esri.com/">Esri</a> | World Imagery'
                };
        }
    };

    const tileConfig = getTileLayer();

    return (
        <MapContainer
            center={[center.lat, center.lng]}
            zoom={zoom}
            style={{ width: '100%', height: '100%', borderRadius: '1rem' }}
            scrollWheelZoom={true}
            preferCanvas={true} // Performance optimization for many markers
        >
            <MapController center={center} zoom={zoom} />

            <TileLayer
                url={tileConfig.url}
                attribution={tileConfig.attribution}
                maxZoom={18}
            />

            {/* Overlay labels for satellite view only */}
            {variant === 'satellite' && (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    attribution=''
                    maxZoom={18}
                />
            )}

            {markers.map((marker, index) => {
                const score = marker.score ?? 0.5;
                const color = score > 0.7 ? '#22c55e' : score > 0.4 ? '#eab308' : '#6b7280';

                return (
                    <Marker
                        key={index}
                        position={[marker.lat, marker.lng]}
                        icon={createColoredIcon(color)}
                        eventHandlers={{
                            click: () => onMarkerClick?.(marker)
                        }}
                    >
                        <Popup>
                            <div className="font-semibold">{marker.title || 'Location'}</div>
                            {marker.score !== undefined && (
                                <div className="text-sm text-gray-600">
                                    Score: {(marker.score * 100).toFixed(0)}%
                                </div>
                            )}
                        </Popup>
                    </Marker>
                );
            })}
        </MapContainer>
    );
};

export default SatelliteMap;
