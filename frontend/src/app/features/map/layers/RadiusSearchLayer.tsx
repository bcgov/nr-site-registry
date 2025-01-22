import { ActiveToolEnum } from '../../../constants/Constant';
import { CircleLayer } from '../CircleLayer';
import { Site } from '../MapView';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';

interface RadiusSearchLayerProps {
  //radius: number;
  onCrossHairClick: () => void;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>> | null;
}
export function RadiusSearchLayer({
  //radius,
  onCrossHairClick,
  sites,
  setSites,
}: Readonly<RadiusSearchLayerProps>) {
  const { activeTool } = useMapSearchContext();
  if (activeTool === ActiveToolEnum.radiusSearch) {
    return (
      <CircleLayer
        //radius={radius}
        onCrossHairClick={onCrossHairClick}
        sites={sites}
        setSites={setSites}
      />
    );
  }
  return null;
}
