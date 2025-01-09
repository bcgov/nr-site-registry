import { Autocomplete, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import {
  ActiveToolEnum,
  MAP_CONTROLS_RIGHT_LG,
  MAP_CONTROLS_RIGHT_SM,
  MAP_CONTROLS_RIGHT_XL,
  MIN_CIRCLE_RADIUS,
} from '../../constants/Constant';

import { TextSearchButton } from './search/TextSearchButton';

import './MapSearch.css';
import { SearchInput } from './search/SearchInput';
import React, { useContext, useState } from 'react';
import { FindMeButton } from './FindMeButton';
import { HorizontalScroller } from './controls/HorizontalScroller';
import { PolygonSearchButton } from './search/PolygonSearchButton';
import { RadiusSearchButton } from './search/RadiusSearchButton';
import { MapSearchQueryParamsContext } from './mapSearchQueryParamsContext/MapSearchQueryParamsContext';
import { RadiusSearch } from './search/RadiusSearch';
import { PolygonSearch } from './search/PolygonSearch';
import { Site } from './MapView';

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

interface MapSearchProps {
  activeTool?: ActiveToolEnum | null;
  setActiveTool?: React.Dispatch<React.SetStateAction<ActiveToolEnum | null>>;
  radius: number;
  setRadius: React.Dispatch<React.SetStateAction<number>>;
  isLocationVisible: boolean;
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>> | null;
}

export function MapSearch({
  activeTool,
  setActiveTool,
  radius,
  setRadius,
  isLocationVisible,
  setLocationVisible,
  sites,
  setSites,
}: MapSearchProps) {
  const { searchTerm, setQuery, clearQuery } = useContext(
    MapSearchQueryParamsContext,
  );

  const [searchValue, setSearchValue] = useState(searchTerm);
  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const clearSearch = () => {
    setSearchValue('');
    clearQuery();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const submitSearchOnEnterPress = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' || searchValue === null) return;
    setQuery({ search: searchValue }, 'replace');
  };

  const isPolygonTool = activeTool === ActiveToolEnum.polygonSearch;
  const isRadiusTool = activeTool === ActiveToolEnum.radiusSearch;

  const handlePolygonToolClick = () => {
    if (setActiveTool) {
      setActiveTool((prevTool) =>
        prevTool === ActiveToolEnum.polygonSearch
          ? null
          : ActiveToolEnum.polygonSearch,
      );
    }
  };

  const handleRadiusToolClick = () => {
    console.log('Radius tool clicked');
    if (setActiveTool) {
      setActiveTool((prevTool) =>
        prevTool === ActiveToolEnum.radiusSearch
          ? null
          : ActiveToolEnum.radiusSearch,
      );
      setRadius(MIN_CIRCLE_RADIUS);
    }
  };

  return (
    <Box component="div" sx={styles} className="map-search">
      <HorizontalScroller
        isEnabled={isSmall}
        className="map-search-scroller"
        scrollOffset={150}
      >
        {isLarge ? (
          <Stack direction="row" className="map-search-row">
            <Autocomplete
              options={[]}
              value={searchValue}
              onKeyDown={submitSearchOnEnterPress}
              freeSolo
              renderInput={(params) => {
                return (
                  <SearchInput
                    {...params}
                    onChange={handleSearchChange}
                    value={searchValue}
                    sx={searchInputStyles}
                    onClear={clearSearch}
                  />
                );
              }}
              className="search-autocomplete"
              componentsProps={componentProps}
            />
            <FindMeButton
              isLocationVisible={isLocationVisible}
              setLocationVisible={setLocationVisible}
            />
          </Stack>
        ) : (
          <TextSearchButton />
        )}
        <PolygonSearchButton
          isActive={isPolygonTool}
          onClick={handlePolygonToolClick}
        />
        <RadiusSearchButton
          //mapRef={mapRef}
          isActive={isRadiusTool}
          onClick={handleRadiusToolClick}
        />
      </HorizontalScroller>
      {isLarge && (isPolygonTool || isRadiusTool) && (
        <div className="map-search-tool-row">
          <div className="map-search-tool-box">
            {isPolygonTool ? (
              <PolygonSearch />
            ) : (
              <RadiusSearch
                radius={radius}
                setRadius={setRadius}
                setActiveTool={setActiveTool}
                sites={sites}
                setSites={setSites}
              />
            )}
          </div>
        </div>
      )}
    </Box>
  );
}
