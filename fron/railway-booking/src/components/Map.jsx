import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

const MapComponent = () => {
  const mapRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const [featureCount, setFeatureCount] = useState(0);
  const [lastAction, setLastAction] = useState('');

  // Custom marker icon
  const customIcon = L.icon({
    iconUrl: 'https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('map').setView([12.9716, 77.5946], 13);
    mapRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Create layer for drawn items
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    // Add draw controls with custom options
    const drawControl = new L.Control.Draw({
      draw: {
        polygon: {
          shapeOptions: {
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2
          },
          allowIntersection: false,
          showArea: true
        },
        polyline: {
          shapeOptions: {
            color: '#3388ff',
            weight: 5
          }
        },
        rectangle: {
          shapeOptions: {
            color: '#3388ff',
            fillColor: '#3388ff',
            fillOpacity: 0.2
          }
        },
        circle: false,
        marker: {
          icon: customIcon
        }
      },
      edit: {
        featureGroup: drawnItems,
        remove: true
      }
    });

    map.addControl(drawControl);

    // Handle created shapes
    const handleDrawCreated = (e) => {
      const layer = e.layer;
      drawnItems.addLayer(layer);
      setFeatureCount(prev => prev + 1);
      setLastAction(`Added: ${e.layerType}`);

      if (layer instanceof L.Marker) {
        const { lat, lng } = layer.getLatLng();
        layer.bindPopup(`Marker at:<br>Lat: ${lat.toFixed(4)}<br>Lng: ${lng.toFixed(4)}`).openPopup();
        console.log('Marker placed at:', lat, lng);
      }
    };

    // Handle deleted shapes
    const handleDrawDeleted = () => {
      setFeatureCount(prev => prev - 1);
      setLastAction('Deleted feature');
    };

    // Handle edited shapes
    const handleDrawEdited = () => {
      setLastAction('Edited feature');
    };

    map.on(L.Draw.Event.CREATED, handleDrawCreated);
    map.on('draw:deleted', handleDrawDeleted);
    map.on('draw:edited', handleDrawEdited);

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.off(L.Draw.Event.CREATED, handleDrawCreated);
        mapRef.current.off('draw:deleted', handleDrawDeleted);
        mapRef.current.off('draw:edited', handleDrawEdited);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div style={{
      maxWidth: '800px',
      margin: '20px auto',
      padding: '20px',
      backgroundColor: 'var(--card-dark)',
      border: '1px solid var(--border-dark)',
      borderRadius: '8px',
      boxShadow: '0 0 15px rgba(0,0,0,0.3)',
      color: 'var(--text-light)'
    }}>
      <h2 style={{ textAlign: 'center', color: 'var(--text-lighter)' }}>Interactive Map</h2>
      <p style={{ textAlign: 'center', marginBottom: '20px', color: 'var(--text-muted)' }}>
        Use the toolbar on the right to draw on the map
      </p>
    
      <div style={{
        width: '100%',
        height: '500px',
        border: '1px solid var(--border-dark)',
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div id="map" style={{ width: '100%', height: '100%' }} />
      </div>
    
      <div style={{
        marginTop: '15px',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '10px',
        background: 'var(--bg-darker)',
        borderRadius: '4px',
        border: '1px solid var(--border-dark)',
        color: 'var(--text-muted)'
      }}>
        <div>Features: <strong style={{ color: 'var(--text-light)' }}>{featureCount}</strong></div>
        <div>Last action: <strong style={{ color: 'var(--text-light)' }}>{lastAction || 'None'}</strong></div>
      </div>
    
      <div style={{ marginTop: '15px', fontSize: '0.9em', color: 'var(--text-muted)' }}>
        <p>Tips:</p>
        <ul style={{ paddingLeft: '1.2rem' }}>
          <li>Click markers to see coordinates</li>
          <li>Use the edit tool to modify shapes</li>
          <li>Use the delete tool to remove features</li>
        </ul>
      </div>
    </div>
    
  );
};

export default MapComponent;