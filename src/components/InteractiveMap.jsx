import { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WMS_BASE_URL = '/geoserver/adabyron/wms';

const FLOOR_LAYERS = {
    S1: 'adabyron:spaces_floor_s1_ada_byron_ui',
    0: 'adabyron:spaces_floor_0_ada_byron_ui',
    1: 'adabyron:spaces_floor_1_ada_byron_ui',
    2: 'adabyron:spaces_floor_2_ada_byron_ui',
    3: 'adabyron:spaces_floor_3_ada_byron_ui',
    4: 'adabyron:spaces_floor_4_ada_byron_ui',
    5: 'adabyron:spaces_floor_5_ada_byron_ui',
};

function FeatureInfoPopup({ url, layer, onSpaceSelect }) {
    const map = useMapEvents({
        click: async (e) => {
            const size = map.getSize();
            const bounds = map.getBounds();
            const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

            const params = new URLSearchParams({
                request: 'GetFeatureInfo',
                service: 'WMS',
                srs: 'EPSG:4326',
                version: '1.1.1',
                format: 'image/png',
                bbox,
                height: Math.round(size.y),
                width: Math.round(size.x),
                layers: layer,
                query_layers: layer,
                info_format: 'application/json',
                x: Math.round(e.containerPoint.x),
                y: Math.round(e.containerPoint.y)
            });

            try {
                const response = await fetch(`${url}?${params.toString()}`);
                if (!response.ok) throw new Error('Network response was not ok');

                const data = await response.json();

                if (data.features && data.features.length > 0) {
                    const properties = data.features[0].properties;

                    if (onSpaceSelect) {
                        onSpaceSelect(properties);
                    }
                } else {
                    if (onSpaceSelect) {
                        onSpaceSelect(null);
                    }
                }
            } catch (error) {
                console.error('Error al consultar WMS GetFeatureInfo:', error);
                if (onSpaceSelect) {
                    onSpaceSelect(null);
                }
            }
        }
    });

    return null; /* No se renderiza la burbuja blanca de Leaflet nativa */
}

export default function InteractiveMap({ selectedFloor, onSpaceSelect }) {
    // Note: The parent MapPage now controls selectedFloor!
    return (
        <MapContainer
            center={[41.68365, -0.8881]}
            zoom={19}
            maxZoom={22}
            className="w-full h-full rounded-2xl shadow-sm border border-gray-200"
            zoomControl={false}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            touchZoom={false}
            boxZoom={false}
            keyboard={false}
        >
            <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={22}
                maxNativeZoom={19}
            />

            <WMSTileLayer
                key={selectedFloor}
                url={WMS_BASE_URL}
                layers={FLOOR_LAYERS[selectedFloor] || 'adabyron:spaces_floor_0_ada_byron_ui'}
                format="image/png"
                transparent={true}
                maxZoom={22}
            />

            <FeatureInfoPopup
                url={WMS_BASE_URL}
                layer={FLOOR_LAYERS[selectedFloor] || 'adabyron:spaces_floor_0_ada_byron_ui'}
                onSpaceSelect={onSpaceSelect}
            />
        </MapContainer>
    );
}