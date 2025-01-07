import { Button } from '@mui/material';
import clsx from 'clsx';
import { DrawPolygon } from '../../../components/common/icon';

interface Props {
  isActive: boolean;
  onClick: () => void;
}
export function PolygonSearchButton({ isActive, onClick }: Readonly<Props>) {
  return (
    <Button
      color="secondary"
      size="medium"
      variant="contained"
      className={clsx('map-button map-button--medium')}
      startIcon={
        <DrawPolygon
          title="Polygon search icon"
          className="polygon-search-icon"
        />
      }
      onClick={onClick}
    >
      Polygon Search
    </Button>
  );
}
