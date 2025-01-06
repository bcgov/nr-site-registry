import { ActiveToolEnum } from '../../../constants/Constant';
import { CircleLayer } from '../CircleLayer';

interface PointSearchLayerProps {
  activeTool: ActiveToolEnum | null;
  radius: number;
}
export function PointSearchLayer({
  activeTool,
  radius,
}: Readonly<PointSearchLayerProps>) {
  if (activeTool === ActiveToolEnum.radiusSearch) {
    return <CircleLayer radius={radius} />;
  }
  return null;
}
