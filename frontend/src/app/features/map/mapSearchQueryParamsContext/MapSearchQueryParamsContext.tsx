import { createContext, ReactElement } from 'react';
import {
  DecodedValueMap,
  StringParam,
  UrlUpdateType,
  useQueryParams,
} from 'use-query-params';

const acceptedParams = { site: StringParam, search: StringParam };
interface MapSearchQueryParamsContextType {
  selectedSiteId: string | null;
  searchTerm: string | null;
  setQuery: (
    values: Partial<DecodedValueMap<typeof acceptedParams>>,
    updateType?: UrlUpdateType,
  ) => void;
  clearQuery: () => void;
}

export const MapSearchQueryParamsContext =
  createContext<MapSearchQueryParamsContextType>({
    selectedSiteId: null,
    searchTerm: null,
    setQuery: () => {},
    clearQuery: () => {},
  });

export const MapSearchQueryProvider = ({
  children,
}: {
  children: ReactElement;
}) => {
  const [query, setQuery] = useQueryParams(acceptedParams);

  const clearQuery = () => setQuery({}, 'replace');

  return (
    <MapSearchQueryParamsContext.Provider
      value={{
        selectedSiteId: query.site || null,
        searchTerm: query.search || null,
        setQuery,
        clearQuery,
      }}
    >
      {children}
    </MapSearchQueryParamsContext.Provider>
  );
};
