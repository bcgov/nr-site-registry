import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@react-pdf/renderer', () => ({
  View: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  StyleSheet: { create: (s: any) => s },
  Font: { register: jest.fn() },
}));

jest.mock('../PdfStyles', () => ({
  pdfStyles: {
    subSectionTitle: {},
    label: {},
    value: {},
    noData: {},
    row: {},
    section: {},
    sectionTitle: {},
    tableHeader: {},
    tableHeaderCell: {},
    tableRow: {},
    tableRowAlt: {},
    tableCell: {},
  },
}));

jest.mock('../../../../helpers/utility', () => ({
  formatDate: (val: any) => (val ? String(val) : '—'),
}));

import PdfDisclosure from './PdfDisclosure';

const mockDisclosure = {
  id: '1',
  siteRegDateRecd: '2024-01-15',
  dateCompleted: '2024-02-01',
  localAuthDateRecd: '2024-01-20',
  rwmDateDecision: '2024-03-01',
  siteRegDateEntered: '2024-01-16',
  plannedActivityComment: 'Residential development planned.',
  siteDisclosureComment: 'Records searched at city hall.',
  govDocumentsComment: 'No government orders found.',
  siteProfileSchedule2Refs: [
    {
      id: 'ref-1',
      schedule2ReferenceCode: 'C0',
      description: 'Metal smelting',
    },
    {
      id: 'ref-2',
      schedule2ReferenceCode: 'F2',
      description: 'Wood treatment',
    },
  ],
  siteProfileQA: [
    { question: 'Is there contamination?', category: 'Environmental' },
    { question: 'Was soil tested?', category: 'Testing' },
  ],
};

describe('PdfDisclosure', () => {
  describe('empty state', () => {
    test('renders empty message when disclosure is null', () => {
      render(<PdfDisclosure disclosure={null} />);
      expect(
        screen.getByText('No disclosure information recorded.'),
      ).toBeInTheDocument();
    });

    test('renders empty message when disclosure is undefined', () => {
      render(<PdfDisclosure disclosure={undefined} />);
      expect(
        screen.getByText('No disclosure information recorded.'),
      ).toBeInTheDocument();
    });

    test('renders empty message when disclosure is empty array', () => {
      render(<PdfDisclosure disclosure={[]} />);
      expect(
        screen.getByText('No disclosure information recorded.'),
      ).toBeInTheDocument();
    });
  });

  describe('single disclosure', () => {
    test('renders date fields', () => {
      render(<PdfDisclosure disclosure={[mockDisclosure]} />);
      expect(screen.getByText('Date Received')).toBeInTheDocument();
      expect(screen.getByText('Date Completed')).toBeInTheDocument();
      expect(screen.getByText('Local Authority Received')).toBeInTheDocument();
      expect(screen.getByText('Date Registrar Received')).toBeInTheDocument();
      expect(screen.getByText('Date Entered')).toBeInTheDocument();
    });

    test('does not render numbered heading for single disclosure', () => {
      render(<PdfDisclosure disclosure={[mockDisclosure]} />);
      expect(
        screen.queryByText('Disclosure Statement 1'),
      ).not.toBeInTheDocument();
    });

    test('renders Schedule 2 References table', () => {
      render(<PdfDisclosure disclosure={[mockDisclosure]} />);
      expect(
        screen.getByText(
          'III Commercial and Industrial Purposes or Activities on Site',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('C0')).toBeInTheDocument();
      expect(screen.getByText('Metal smelting')).toBeInTheDocument();
      expect(screen.getByText('F2')).toBeInTheDocument();
      expect(screen.getByText('Wood treatment')).toBeInTheDocument();
    });

    test('renders Q&A section with data', () => {
      render(<PdfDisclosure disclosure={[mockDisclosure]} />);
      expect(
        screen.getByText('Site Disclosure Questions Answered with Yes'),
      ).toBeInTheDocument();
      expect(screen.getByText('Is there contamination?')).toBeInTheDocument();
      expect(screen.getByText('Environmental')).toBeInTheDocument();
      expect(screen.getByText('Was soil tested?')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
    });

    test('renders Q&A empty message when no questions', () => {
      const disclosureNoQA = { ...mockDisclosure, siteProfileQA: [] };
      render(<PdfDisclosure disclosure={[disclosureNoQA]} />);
      expect(
        screen.getByText('Site Disclosure Questions Answered with Yes'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'There are no questions and categories found for this site disclosure.',
        ),
      ).toBeInTheDocument();
    });

    test('renders comments section with values', () => {
      render(<PdfDisclosure disclosure={[mockDisclosure]} />);
      expect(
        screen.getByText('IV Additional Comments and Explanations'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Residential development planned.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Records searched at city hall.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('No government orders found.'),
      ).toBeInTheDocument();
    });

    test('renders dash for null comment values', () => {
      const disclosureNoComments = {
        ...mockDisclosure,
        plannedActivityComment: null,
        siteDisclosureComment: null,
        govDocumentsComment: null,
      };
      render(<PdfDisclosure disclosure={[disclosureNoComments]} />);
      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('multiple disclosures', () => {
    test('renders numbered headings', () => {
      const disclosures = [
        { ...mockDisclosure, id: '1' },
        { ...mockDisclosure, id: '2' },
      ];
      render(<PdfDisclosure disclosure={disclosures} />);
      expect(screen.getByText('Disclosure Statement 1')).toBeInTheDocument();
      expect(screen.getByText('Disclosure Statement 2')).toBeInTheDocument();
    });
  });

  describe('Schedule 2 hidden when empty', () => {
    test('does not render Schedule 2 section when refs are empty', () => {
      const disclosureNoRefs = {
        ...mockDisclosure,
        siteProfileSchedule2Refs: [],
      };
      render(<PdfDisclosure disclosure={[disclosureNoRefs]} />);
      expect(
        screen.queryByText(
          'III Commercial and Industrial Purposes or Activities on Site',
        ),
      ).not.toBeInTheDocument();
    });
  });
});
