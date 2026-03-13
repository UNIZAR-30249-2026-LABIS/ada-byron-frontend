// TODO: MapPage — página principal con el mapa interactivo (InteractiveMap) y el banner de notificaciones
import InteractiveMap from '../components/InteractiveMap';

export default function MapPage() {
    return (
        <div>
            <h1>Mapa del Ada Byron</h1>
            <InteractiveMap />
        </div>
    );
}