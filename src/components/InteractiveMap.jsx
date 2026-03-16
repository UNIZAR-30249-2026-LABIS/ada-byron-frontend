import { useState } from 'react';
import { MapContainer, TileLayer, WMSTileLayer, useMapEvents, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WMS_BASE_URL = '/geoserver/adabyron/wms';


const FLOOR_LAYERS = {
    S1: 'adabyron:spaces_floor_s1_ada_byron',
    0: 'adabyron:spaces_floor_0_ada_byron',
    1: 'adabyron:spaces_floor_1_ada_byron',
    2: 'adabyron:spaces_floor_2_ada_byron',
    3: 'adabyron:spaces_floor_3_ada_byron',
    4: 'adabyron:spaces_floor_4_ada_byron',
    5: 'adabyron:spaces_floor_5_ada_byron',
};
const FLOOR_LABELS = {
    S1: 'Sótano 1',
    0: 'Planta baja',
    1: 'Planta 1',
    2: 'Planta 2',
    3: 'Planta 3',
    4: 'Planta 4',
    5: 'Planta 5',
};

function FeatureInfoPopup({ url, layer }) {
    const [info, setInfo] = useState(null);

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
                bbox: bbox,
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
                    setInfo({
                        latlng: e.latlng,
                        properties: data.features[0].properties
                    });
                } else {
                    setInfo(null);
                }
            } catch (error) {
                console.error("Error al consultar WMS GetFeatureInfo:", error);
                setInfo(null);
            }
        }
    });

    if (!info) return null;

    return (
        <Popup position={info.latlng} onClose={() => setInfo(null)}>
            <div style={{ minWidth: '200px' }}>
                <h4 style={{ marginTop: 0, marginBottom: '8px', borderBottom: '1px solid #ccc', paddingBottom: '4px' }}>
                    Información
                </h4>
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {Object.entries(info.properties).map(([key, value]) => {
                        if (key === 'bbox' || value === null || value === '') return null;

                        const formattedKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
                        return (
                            <div key={key} style={{ marginBottom: '4px', fontSize: '13px' }}>
                                <strong>{formattedKey}:</strong> {value.toString()}
                            </div>
                        );
                    })}
                </div>
            </div>
        </Popup>
    );
}

export default function InteractiveMap() {
    const [selectedFloor, setSelectedFloor] = useState('0');

    return (
        <div>
            <div style={{ marginBottom: '1rem' }}>
                <p style={{ marginBottom: '0.5rem' }}>
                    <strong>Planta seleccionada:</strong> {FLOOR_LABELS[selectedFloor]}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['S1', '0', '1', '2', '3', '4', '5'].map((floor) => (
                        <button
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '8px',
                                border: selectedFloor === floor ? '2px solid #2563eb' : '1px solid #d1d5db',
                                background: selectedFloor === floor ? '#dbeafe' : '#ffffff',
                                fontWeight: selectedFloor === floor ? 'bold' : 'normal',
                                cursor: 'pointer',
                            }}
                        >
                            {floor}
                        </button>
                    ))}
                </div>
            </div>

            <MapContainer
                center={[41.68365, -0.8881]}
                zoom={19}
                maxZoom={22}
                style={{ height: '80vh', width: '100%', borderRadius: '12px' }}
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
                    layers={FLOOR_LAYERS[selectedFloor]}
                    format="image/png"
                    transparent={true}
                    maxZoom={22}
                />

                <FeatureInfoPopup url={WMS_BASE_URL} layer={FLOOR_LAYERS[selectedFloor]} />
            </MapContainer>
        </div>
    );
}