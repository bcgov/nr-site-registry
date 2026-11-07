import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Grid from '../../components/grid/Grid';
import { buildRecentViewColumns } from './recentViewColumns';
import { RecentView } from './recentViews';

const row: RecentView = {
  userId: 'user',
  siteId: '182',
  address: '1 Main Street',
  city: 'Victoria',
  generalDescription: 'A site',
  whenUpdated: '2016-11-22T08:00:00.000Z',
};

describe('buildRecentViewColumns', () => {
  it('styles site id and action links with the shared table link', () => {
    render(
      <MemoryRouter>
        <Grid
          label="Recently Viewed"
          rows={[row]}
          columns={buildRecentViewColumns()}
          sort={null}
          onSortChange={() => {}}
          loading={false}
          fetching={false}
          empty={false}
        />
      </MemoryRouter>,
    );

    const siteId = screen.getByRole('link', { name: 'Site ID 182' });
    const map = screen.getByRole('link', { name: 'Map 182' });
    const details = screen.getByRole('link', { name: 'Details 182' });

    expect(siteId).toHaveClass('table-cell-link');
    expect(siteId).not.toHaveClass('custom-dashboard-input-txt');
    expect(siteId).toHaveAttribute('href', '/site/details/182');
    expect(map).toHaveClass('table-cell-link');
    expect(map).not.toHaveClass('custom-dashboard-link');
    expect(details).toHaveClass('table-cell-link');
    expect(details).toHaveTextContent('View');
  });
});
