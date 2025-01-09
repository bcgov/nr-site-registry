import { ActiveToolEnum } from '../../../constants/Constant';
import { CircleLayer } from '../CircleLayer';
import { Site } from '../MapView';

interface RadiusSearchLayerProps {
  activeTool: ActiveToolEnum | null;
  radius: number;
  onCrossHairClick: () => void;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>> | null;
}
export function RadiusSearchLayer({
  activeTool,
  radius,
  onCrossHairClick,
  sites,
  setSites,
}: Readonly<RadiusSearchLayerProps>) {
  if (activeTool === ActiveToolEnum.radiusSearch) {
    return (
      <CircleLayer
        radius={radius}
        onCrossHairClick={onCrossHairClick}
        sites={sites}
        setSites={setSites}
      />
    );
  }
  return null;
}
