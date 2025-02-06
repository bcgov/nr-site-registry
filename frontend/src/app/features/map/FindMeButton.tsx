import { FindMe } from '../../components/common/icon';
import { useGeolocationPermission } from '../../../hooks/useMyLocation';
import { Button } from '../../components/button/Button';

interface FindMeButtonProps {
  isLocationVisible: boolean;
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function FindMeButton({
  isLocationVisible,
  setLocationVisible,
}: FindMeButtonProps) {
  const state = useGeolocationPermission();

  if (state === 'denied') {
    return null;
  }

  const onClick = () => {
    setLocationVisible((prev) => !prev);
  };

  return (
    <Button variant="secondary" className="map-button" onClick={onClick}>
      <FindMe title="Find me icon" />
      Find Me
    </Button>
  );
}
