import { ActiveToolEnum } from '../../../constants/Constant';
import { CircleLayer } from '../CircleLayer';

interface RadiusSearchLayerProps {
  activeTool: ActiveToolEnum | null;
  radius: number;
  onCrossHairClick: () => void;
}
export function RadiusSearchLayer({
  activeTool,
  radius,
  onCrossHairClick,
}: Readonly<RadiusSearchLayerProps>) {
  if (activeTool === ActiveToolEnum.radiusSearch) {
    return <CircleLayer radius={radius} onCrossHairClick={onCrossHairClick} />;
  }
  return null;
}
