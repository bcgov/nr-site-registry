import { MagnifyingGlassIcon } from '../../../components/common/icon';
import { Button } from '../../../components/button/Button';

export function TextSearchButton() {
  return (
    <>
      <Button
        variant="secondary"
        className="map-button"
        aria-label="Text Search"
      >
        <MagnifyingGlassIcon title="Search icon" />
        Text Search
      </Button>
    </>
  );
}
