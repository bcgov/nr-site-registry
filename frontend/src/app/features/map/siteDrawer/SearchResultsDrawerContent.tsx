import { FC } from 'react';
import { Site } from '../MapView';

interface SearchResultsDrawerContentProps {
  sites: Site[];
  loading: boolean;
}
export const SearchResultsDrawerContent: FC<
  SearchResultsDrawerContentProps
> = ({ sites, loading }) => {
  return (
    <div>
      {loading && <div>loading</div>}
      <pre>{JSON.stringify(sites, null, 2)}</pre>
    </div>
  );
};
