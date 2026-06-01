import React from 'react';
import { render, screen } from '@testing-library/react';

// Mock @react-pdf/renderer primitives as simple HTML elements
jest.mock('@react-pdf/renderer', () => ({
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  StyleSheet: { create: (s: any) => s },
  Font: { register: jest.fn() },
}));

import PdfField from './PdfField';
import PdfSection from './PdfSection';
import PdfTable from './PdfTable';

describe('PdfField', () => {
  test('renders label and value', () => {
    render(<PdfField label="Site ID" value="137" />);
    expect(screen.getByText('Site ID')).toBeInTheDocument();
    expect(screen.getByText('137')).toBeInTheDocument();
  });

  test('renders dash when value is null', () => {
    render(<PdfField label="City" value={null} />);
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });
});

describe('PdfSection', () => {
  test('renders title and children when not empty', () => {
    render(
      <PdfSection title="Summary">
        <span>Content</span>
      </PdfSection>,
    );
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders empty message when isEmpty is true', () => {
    render(
      <PdfSection title="Documents" isEmpty={true} emptyMessage="No documents.">
        <span>Should not render</span>
      </PdfSection>,
    );
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('No documents.')).toBeInTheDocument();
    expect(screen.queryByText('Should not render')).not.toBeInTheDocument();
  });
});

describe('PdfTable', () => {
  const columns = [
    { label: 'Name', width: '50%', getValue: (r: any) => r.name },
    { label: 'City', width: '50%', getValue: (r: any) => r.city },
  ];

  test('renders header and row data', () => {
    const rows = [{ name: 'Site A', city: 'Victoria' }];
    render(<PdfTable columns={columns} rows={rows} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
    expect(screen.getByText('Site A')).toBeInTheDocument();
    expect(screen.getByText('Victoria')).toBeInTheDocument();
  });

  test('renders dash for null values', () => {
    const rows = [{ name: 'Site B', city: null }];
    render(<PdfTable columns={columns} rows={rows} />);
    expect(screen.getByText('Site B')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  test('handles empty rows array', () => {
    render(<PdfTable columns={columns} rows={[]} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('City')).toBeInTheDocument();
  });
});
