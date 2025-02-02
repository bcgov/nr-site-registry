import { OverlayTrigger, Popover, Form } from 'react-bootstrap';
import { Button } from '../../../components/button/Button';
import { DropdownIcon, LayersIcon } from '../../../components/common/icon';
import { DATA_LAYERS, LayerKey } from './Layers';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';

import './DataLayersMenu.css';

export const DataLayersMenu = () => {
  const { selectedDataLayers, toggleDataLayerSelection, resetDataLayers } =
    useMapSearchContext();

  return (
    <OverlayTrigger
      show
      trigger="click"
      placement={'bottom-end'}
      rootClose
      transition={false}
      overlay={
        <Popover className="px-3 py-2">
          <ul className="list-unstyled">
            {Object.entries(DATA_LAYERS).map(([key, layer]) => {
              const layerKey = key as LayerKey;
              return (
                <li key={key}>
                  <Form.Check>
                    <Form.Check.Input
                      size={200}
                      checked={selectedDataLayers.has(layerKey)}
                      onChange={() => {
                        toggleDataLayerSelection(layerKey);
                      }}
                      className="data-layers-checkbox"
                    />
                    <Form.Check.Label className="fw-bold">
                      {layer.name}
                    </Form.Check.Label>
                  </Form.Check>
                </li>
              );
            })}
          </ul>
          <div className="d-flex justify-content-center">
            <Button
              variant="secondary"
              disabled={selectedDataLayers.size === 0}
              onClick={resetDataLayers}
            >
              Reset Layers
            </Button>
          </div>
        </Popover>
      }
    >
      <Button variant="secondary" className="data-layers-menu-trigger">
        <LayersIcon />
        Layers
        <DropdownIcon />
      </Button>
    </OverlayTrigger>
  );
};
