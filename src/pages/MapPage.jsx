import { useState } from 'react';
import InteractiveMap from '../components/InteractiveMap';
import ReservationForm from '../components/ReservationForm';

export default function MapPage() {
    const [selectedSpace, setSelectedSpace] = useState(null);

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Mapa del Ada Byron</h1>

            <InteractiveMap onSpaceSelect={setSelectedSpace} />

            <div
                style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    marginTop: '1rem',
                }}
            >
                <div
                    style={{
                        padding: '0.75rem',
                        background: 'white',
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        width: '240px',
                        fontSize: '14px'
                    }}
                >
                    <strong>Leyenda</strong>
                    <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', marginRight: 8 }}></span>Laboratorio</div>
                    <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', marginRight: 8 }}></span>Aula</div>
                    <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#0ea5e9', marginRight: 8 }}></span>Sala informática</div>
                    <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#8b5cf6', marginRight: 8 }}></span>Seminario / Sala reuniones</div>
                    <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a855f7', marginRight: 8 }}></span>Despacho</div>
                    <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ffffff', marginRight: 8, border: '1px solid #ccc' }}></span>Contexto</div>
                </div>

                <ReservationForm selectedSpace={selectedSpace} />
            </div>
        </div>
    );
}