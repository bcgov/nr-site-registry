import { ActiveToolEnum } from '../../../constants/Constant';
import { CircleLayer } from '../CircleLayer';

interface RadiusSearchLayerProps {
  activeTool: ActiveToolEnum | null;
  radius: number;
}
export function RadiusSearchLayer({
  activeTool,
  radius,
}: Readonly<RadiusSearchLayerProps>) {
  if (activeTool === ActiveToolEnum.radiusSearch) {
    return <CircleLayer radius={radius} />;
  }
  return null;
}
