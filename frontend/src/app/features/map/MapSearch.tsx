import { Autocomplete, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Map } from 'leaflet';

import {
  ActiveToolEnum,
  MAP_CONTROLS_RIGHT_LG,
  MAP_CONTROLS_RIGHT_SM,
  MAP_CONTROLS_RIGHT_XL,
} from '../../constants/Constant';

import { TextSearchButton } from './search/TextSearchButton';

import './MapSearch.css';
import { SearchInput } from './search/SearchInput';
import React, { RefObject, useContext, useState } from 'react';
import { FindMeButton } from './FindMeButton';
import { HorizontalScroller } from './controls/HorizontalScroller';
import { PolygonSearchButton } from './search/PolygonSearchButton';
import { RadiusSearchButton } from './search/RadiusSearchButton';
import { MapSearchQueryParamsContext } from './mapSearchQueryParamsContext/MapSearchQueryParamsContext';
import { RadiusSearch } from './search/RadiusSearch';
import { PolygonSearch } from './search/PolygonSearch';
import { useMapSearch_FindSitesAndPlacesQuery } from '../../../graphql/generated';
import useDebouncedValue from '../../helpers/useDebouncedValue';
import { getZoom, MAP_FLY_OPTIONS } from './mapOptions';
import {
  AutocompleteItem,
  AutocompleteOption,
} from './search/AutocompleteOption';

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
  mapRef: RefObject<Map | null>;
  isLocationVisible: boolean;
  setLocationVisible: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MapSearch({
  isLocationVisible,
  setLocationVisible,
  mapRef,
}: MapSearchProps) {
  const { searchTerm, setQuery, clearQuery } = useContext(
    MapSearchQueryParamsContext,
  );

  const [searchValue, setSearchValue] = useState(searchTerm);
  const searchValueDebounced = useDebouncedValue(searchValue);

  const theme = useTheme();
  const isLarge = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const { data } = useMapSearch_FindSitesAndPlacesQuery({
    variables: {
      searchParam: searchValueDebounced || '',
    },
    skip: (searchValueDebounced?.length ?? 0) < 3,
  });

  const clearSearch = () => {
    setSearchValue('');
    clearQuery();
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (searchValue) {
      setQuery({ search: searchValue }, 'replace');
      return;
    }
  };

  const [activeTool, setActiveTool] = useState<ActiveToolEnum | null>(null);
  const isPolygonTool = activeTool === ActiveToolEnum.polygonSearch;
  const isRadiusTool = activeTool === ActiveToolEnum.radiusSearch;

  const handlePolygonToolClick = () => {
    setActiveTool((prevTool) =>
      prevTool === ActiveToolEnum.polygonSearch
        ? null
        : ActiveToolEnum.polygonSearch,
    );
  };

  const handleRadiusToolClick = () => {
    console.log('Radius tool clicked');
    setActiveTool((prevTool) =>
      prevTool === ActiveToolEnum.radiusSearch
        ? null
        : ActiveToolEnum.radiusSearch,
    );
  };

  const onOptionSelect = (option: AutocompleteOption) => {
    if (
      !mapRef.current ||
      !option.id ||
      !option.latdeg ||
      !option.longdeg ||
      !option.type
    )
      return;

    const lat = option.latdeg;
    const lng = option.longdeg;

    mapRef.current.flyTo(
      { lat, lng },
      getZoom(mapRef.current),
      MAP_FLY_OPTIONS,
    );

    if (option?.type === 'Sites') {
      setQuery({ site: option.id }, 'replace');
    }
  };

  const autocompleteOptions = data
    ? [
        ...data.findSitesAndPlaces.sites.map(
          ({ id, commonName: label, latdeg, longdeg, __typename }) => ({
            id,
            label,
            latdeg,
            longdeg,
            type: __typename,
          }),
        ),
        ...data.findSitesAndPlaces.places.map(
          ({ id, name: label, latdeg, longdeg, __typename }) => ({
            id,
            label,
            latdeg,
            longdeg,
            type: __typename,
          }),
        ),
      ]
    : [];

  return (
    <Box component="div" sx={styles} className="map-search">
      <HorizontalScroller
        isEnabled={isSmall}
        className="map-search-scroller"
        scrollOffset={150}
      >
        {isLarge ? (
          <Stack direction="row" className="map-search-row">
            <form onSubmit={submitSearch}>
              <Autocomplete
                options={autocompleteOptions}
                value={searchValue}
                freeSolo
                onChange={(_, option) => {
                  if (typeof option === 'string' || option === null) return;
                  onOptionSelect(option);
                }}
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
                slotProps={componentProps}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props;
                  return (
                    <AutocompleteItem
                      key={key}
                      option={option}
                      {...optionProps}
                    />
                  );
                }}
              />
            </form>
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
              <RadiusSearch setActiveTool={setActiveTool} />
            )}
          </div>
        </div>
      )}
    </Box>
  );
}
