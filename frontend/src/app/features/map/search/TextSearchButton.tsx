import { useState } from 'react';
import { Button } from '@mui/material';
import clsx from 'clsx';

//import { SearchDialog } from './SearchDialog'
import { MagnifyingGlassIcon } from '../../../components/common/icon';

export function TextSearchButton() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        size="medium"
        className={clsx(
          'map-button',
          'map-button--medium',
          open && 'map-button--active',
        )}
        startIcon={<MagnifyingGlassIcon title="Search icon" />}
        onClick={() => setOpen(true)}
        aria-label="Text Search"
      >
        Text Search
      </Button>
      {/*open && <SearchDialog onClose={() => setOpen(false)} />*/}
    </>
  );
}
