import { Autocomplete, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import {
  MAP_CONTROLS_RIGHT_LG,
  MAP_CONTROLS_RIGHT_SM,
  MAP_CONTROLS_RIGHT_XL,
} from '../../constants/Constant';
//import { useActiveTool } from '@/features/map/map-slice'
// import { DataLayersButton } from './DataLayersButton'
// import { FilterByButton } from './FilterByButton'
// import { FindMeButton } from './FindMeButton'
// import { PointSearch } from './PointSearch'
// import { PointSearchButton } from './PointSearchButton'
// import { PolygonSearchButton } from './PolygonSearchButton'
// import { PolygonSearch } from './PolygonSearch'
// import { SearchByButton } from './SearchByButton'
//import { SearchAutocomplete } from './SearchAutocomplete'
import { TextSearchButton } from './search/TextSearchButton';

import './MapSearch.css';
import { SearchInput } from './search/SearchInput';
import React, { useState } from 'react';
import { FindMe } from '../../components/common/icon';
import { FindMeButton } from './FindMeButton';
import { useMapSearchQuery } from '../../../graphql/generated';

const styles = {
  marginTop: {
    md: '40px',
  },
  left: {
    xs: '24px',
    md: '72px',
    lg: '48px',
    xl: '72px',
  },
  right: {
    xs: `${MAP_CONTROLS_RIGHT_SM}px`,
    lg: `${MAP_CONTROLS_RIGHT_LG}px`,
    xl: `${MAP_CONTROLS_RIGHT_XL}px`,
  },
  flexWrap: {
    md: 'wrap',
  },
};

const searchInputStyles = {
  width: {
    xxl: '632px',
    xl: '542px',
    lg: '452px',
  },
};

const componentProps = {
  popper: {
    modifiers: [
      {
        name: 'offset',
        options: { offset: [0, 6] },
      },
    ],
  },
};

export function MapSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  //const activeTool = useActiveTool()
  // const isPolygonTool = activeTool === ActiveToolEnum.polygonSearch
  // const isPointTool = activeTool === ActiveToolEnum.pointSearch

  const clearSearch = () => {
    setSearchTerm('');
  };

  const options: any[] = [];

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);
  };

  /* TODO: Add Horizontal Scroller for m inimized version */
  return (
    <Box component="div" sx={styles} className="map-search">
      {/* <HorizontalScroller
        isEnabled={isSmall}
        className="map-search-scroller"
        scrollOffset={150}
      > */}
      {isLarge ? (
        <Stack direction="row" className="map-search-row">
          <Autocomplete
            options={options}
            renderInput={() => {
              return <SearchInput sx={searchInputStyles} />;
            }}
            className="search-autocomplete"
            componentsProps={componentProps}
          />
          <FindMeButton />
        </Stack>
      ) : (
        <TextSearchButton />
      )}
      {/* </HorizontalScroller> */}
    </Box>
  );
}
