// TODO: MapPage — página principal con el mapa interactivo (InteractiveMap) y el banner de notificaciones
import InteractiveMap from '../components/InteractiveMap';

export default function MapPage() {
    return (
        <div>
            <h1>Mapa del Ada Byron</h1>
            <InteractiveMap />
            <div style={{
                padding: '0.75rem',
                background: 'white',
                border: '1px solid #ddd',
                borderRadius: '8px',
                width: '220px',
                fontSize: '14px'
            }}>
                <strong>Leyenda</strong>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#ef4444', marginRight: 8 }}></span>Laboratorio</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#3b82f6', marginRight: 8 }}></span>Aula</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#22c55e', marginRight: 8 }}></span>Seminario</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#a855f7', marginRight: 8 }}></span>Despacho</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#6b7280', marginRight: 8 }}></span>Almacén</div>
                <div><span style={{ display: 'inline-block', width: 12, height: 12, background: '#e5e7eb', marginRight: 8, border: '1px solid #ccc' }}></span>Hueco</div>
            </div>
        </div>

    );

}