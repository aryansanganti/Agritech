/// <reference types="vite/client" />
import React from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface GoogleMapsWrapperProps {
    center: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{ lat: number; lng: number; title?: string; score?: number }>;
    onMarkerClick?: (marker: { lat: number; lng: number; title?: string }) => void;
}

export const GoogleMapsWrapper: React.FC<GoogleMapsWrapperProps> = ({
    center,
    zoom = 10,
    markers = [],
    onMarkerClick
}) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-bhumi-muted dark:bg-bhumi-darkMuted">
                <div className="text-center text-bhumi-mutedFg dark:text-bhumi-darkMutedFg p-8">
                    <p className="text-lg font-semibold mb-2">🗺️ Google Maps API Key Required</p>
                    <p className="text-sm">Add <code className="bg-bhumi-card dark:bg-bhumi-darkCard px-2 py-1">VITE_GOOGLE_MAPS_API_KEY</code> to your .env file</p>
                </div>
            </div>
        );
    }

    return (
        <APIProvider apiKey={apiKey}>
            <Map
                style={{ width: '100%', height: '100%' }}
                defaultCenter={center}
                defaultZoom={zoom}
                mapId="seedscout-satellite-map"
                mapTypeId="hybrid"
                disableDefaultUI={false}
                zoomControl={true}
                streetViewControl={false}
                mapTypeControl={false}
                fullscreenControl={true}
            >
                {markers.map((marker, index) => {
                    // Color based on score: green for high, yellow for medium, gray for low
                    const score = marker.score ?? 0.5;
                    const bgColor = score > 0.7 ? '#22c55e' : score > 0.4 ? '#eab308' : '#6b7280';

                    return (
                        <AdvancedMarker
                            key={index}
                            position={{ lat: marker.lat, lng: marker.lng }}
                            title={marker.title}
                            onClick={() => onMarkerClick?.(marker)}
                        >
                            <Pin
                                background={bgColor}
                                borderColor="#fff"
                                glyphColor="#fff"
                            />
                        </AdvancedMarker>
                    );
                })}
            </Map>
        </APIProvider>
    );
};
