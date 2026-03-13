// TODO: InteractiveMap — componente Leaflet del plano del edificio Ada Byron
// Muestra espacios coloreados según disponibilidad y recibe actualizaciones via SignalR
// Dependencias: leaflet, react-leaflet, signalRClient.js


import { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WMS_BASE_URL = 'http://localhost:8080/geoserver/adabyron/wms';

const FLOOR_LAYERS = {
    S1: 'adabyron:spaces_floor_s1_ada_byron',
    0: 'adabyron:spaces_floor_0_ada_byron',
    1: 'adabyron:spaces_floor_1_ada_byron',
};

export default function InteractiveMap() {
    const [selectedFloor, setSelectedFloor] = useState('0');

    return (
        <div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setSelectedFloor('S1')}>S1</button>
                <button onClick={() => setSelectedFloor('0')}>0</button>
                <button onClick={() => setSelectedFloor('1')}>1</button>
            </div>

            <MapContainer
                center={[41.6839, -0.8881]}
                zoom={19}
                style={{ height: '80vh', width: '100%' }}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <WMSTileLayer
                    key={selectedFloor}
                    url={WMS_BASE_URL}
                    layers={FLOOR_LAYERS[selectedFloor]}
                    format="image/png"
                    transparent={true}
                />
            </MapContainer>
        </div>
    );
}

