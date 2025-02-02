import { WMSTileLayer } from 'react-leaflet';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';
import { DATA_LAYERS } from './Layers';

export function MapDataLayers() {
  const { selectedDataLayers } = useMapSearchContext();

  if (selectedDataLayers.size === 0) {
    return null;
  }

  return Array.from(selectedDataLayers).map((selectedLayer) => {
    const { name, url, layers } = DATA_LAYERS[selectedLayer];

    return (
      <WMSTileLayer
        key={`DataLayer-${name}`}
        url={url}
        layers={layers}
        format="image/png"
        transparent
      />
    );
  });
}
