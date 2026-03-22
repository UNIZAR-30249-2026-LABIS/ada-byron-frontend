# Ada Byron Frontend

Frontend del sistema de gestión de reservas del edificio Ada Byron.

Este repositorio contiene la capa de presentación del proyecto, desarrollada con **React + Vite**. Actualmente incluye la visualización cartográfica del edificio mediante **Leaflet** y capas **WMS** publicadas en **GeoServer**.

## Tecnologías utilizadas
- React
- Vite
- Leaflet
- React-Leaflet
- Axios
- SignalR client

## Estado actual
Actualmente están implementadas las funcionalidades base del **PBI 1**:
- Configuración y consumo de cartografía WMS desde GeoServer.
- Visualización del edificio Ada Byron en el mapa.
- Navegación entre plantas:
  - S1
  - 0
  - 1

## Estructura principal del proyecto
```text
src/
├── components/
│   ├── InteractiveMap.jsx
│   └── NotificationBanner.jsx
├── pages/
│   ├── MapPage.jsx
│   └── MyReservationsPage.jsx
├── services/
│   ├── api.js
│   └── signalRClient.js
└── tests/
    └── setup.js
```

## Requisitos previos
Para ejecutar correctamente este frontend en local se necesita:
* Node.js 18 o superior
* npm
* GeoServer levantado
* Capas WMS publicadas para el edificio Ada Byron
* Backend e infraestructura disponibles (si se van a probar otras funcionalidades futuras)

## Instalación
```bash
npm install
```

## Ejecución en desarrollo
```bash
npm run dev
```

## Build de producción
```bash
npm run build
```

## Preview de producción
```bash
npm run preview
```

## Configuración cartográfica actual

### Endpoint WMS
```text
http://localhost:8080/geoserver/adabyron/wms
```

### Layers utilizadas actualmente
* `adabyron:spaces_floor_s1_ada_byron`
* `adabyron:spaces_floor_0_ada_byron`
* `adabyron:spaces_floor_1_ada_byron`

## Funcionalidad implementada del mapa
El componente `InteractiveMap.jsx` permite:
* Mostrar cartografía base.
* Superponer una capa WMS del edificio Ada Byron.
* Cambiar entre distintas plantas.
* Visualizar la geometría del edificio cargada desde GeoServer.

## Dependencias externas
Este frontend depende de:
* **GeoServer** para servir las capas WMS.
* **PostgreSQL + PostGIS** como origen cartográfico del GeoServer.
* **Backend del proyecto** para funcionalidades de autenticación, reservas y tiempo real.

## Flujo cartográfico actual
El flujo de datos cartográficos implementado es:
```text
GeoJSON -> QGIS -> PostGIS -> GeoServer -> WMS -> Leaflet
```


## Autores
Proyecto desarrollado dentro de la asignatura de Laboratorio de Sistemas de Información por Tahir Berga y Miguel Ayllón.
