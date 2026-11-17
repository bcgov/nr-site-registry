import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FormFieldType } from '../input-controls/IFormField';
import { Link as TableCell } from '../input-controls/InputControls';
import { TableLink, tableCellLinkClassName } from './TableLink';

describe('tableCellLinkClassName', () => {
  it('keeps the shared link class and layout utilities', () => {
    expect(
      tableCellLinkClassName(
        'custom-cart-icon-link justify-content-center gap-1',
      ),
    ).toBe('table-cell-link justify-content-center gap-1');
  });

  it('drops page-specific text classes that restyle the link', () => {
    expect(
      tableCellLinkClassName(
        'custom-associate-input-text custom-dashboard-input-txt link-for-table',
      ),
    ).toBe('table-cell-link');
  });
});

describe('TableLink', () => {
  it('renders a site id with the shared link class', () => {
    render(
      <MemoryRouter>
        <TableLink
          to="/site/details/182"
          label="Site ID"
          value="182"
          className="custom-dashboard-input-txt"
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Site ID 182' });
    expect(link).toHaveClass('table-cell-link');
    expect(link).not.toHaveClass('custom-dashboard-input-txt');
    expect(link).toHaveAttribute('href', '/site/details/182');
    expect(link).toHaveTextContent('182');
  });
});

describe('table cell Link', () => {
  it('uses the shared link class inside a section table cell', () => {
    render(
      <MemoryRouter>
        <table>
          <tbody>
            <tr>
              <TableCell
                type={FormFieldType.Link}
                label="Site ID"
                value="200"
                href="/site/details/"
                customInputTextCss="custom-associate-input-text justify-content-center"
                onChange={() => {}}
              />
            </tr>
          </tbody>
        </table>
      </MemoryRouter>,
    );

    const link = screen.getByRole('link', { name: 'Site ID 200' });
    expect(link).toHaveClass('table-cell-link', 'justify-content-center');
    expect(link).not.toHaveClass('custom-associate-input-text');
    expect(link).toHaveAttribute('href', '/site/details/200');
  });
});
