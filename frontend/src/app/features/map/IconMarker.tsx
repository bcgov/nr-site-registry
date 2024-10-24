import { forwardRef, ReactNode } from 'react';
import { Marker } from 'react-leaflet';
import {
  DivIcon,
  Icon,
  LatLngExpression,
  LeafletEventHandlerFnMap,
  LeafletMouseEvent,
  Marker as LeafletMarker,
} from 'leaflet';

interface Props {
  position: LatLngExpression;
  icon?: Icon | DivIcon;
  onClick?: (e: LeafletMouseEvent) => void;
  onHover: (hover: boolean) => void;
  eventHandlers?: LeafletEventHandlerFnMap;
  children?: ReactNode;
  riseOnHover?: boolean;
  [key: string]: any;
}

export const IconMarker = forwardRef<LeafletMarker, Props>(
  (
    {
      position,
      icon,
      onClick,
      onHover,
      eventHandlers = {},
      children = null,
      riseOnHover = false,
      ...rest
    }: Props,
    ref,
  ) => {
    if (onClick) {
      eventHandlers = {
        ...eventHandlers,
        click: onClick,
      };
    }

    if (onHover) {
      eventHandlers = {
        ...eventHandlers,
        mouseover: () => onHover(true),
        mouseout: () => onHover(false),
      };
    }
    return (
      <Marker
        ref={ref}
        position={position}
        icon={icon}
        eventHandlers={eventHandlers}
        riseOnHover={riseOnHover}
        {...rest}
      >
        {children}
      </Marker>
    );
  },
);

IconMarker.displayName = 'IconMarker';
