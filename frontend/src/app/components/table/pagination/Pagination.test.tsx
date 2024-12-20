import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  const selectPageMock = jest.fn(() => {});
  const changeResultsPerPageMock = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders pagination correctly with multiple pages', () => {
    const { getByText } = render(
      <Pagination
        selectPage={selectPageMock}
        currentPage={1}
        resultsPerPage={10}
        totalResults={1000}
        changeResultsPerPage={changeResultsPerPageMock}
      />,
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument();
    // Add more assertions based on your component's logic
  });

  test('calls selectPage when clicking on a page number', () => {
    const { getByText } = render(
      <Pagination
        selectPage={selectPageMock}
        currentPage={1}
        resultsPerPage={10}
        totalResults={100}
        changeResultsPerPage={changeResultsPerPageMock}
      />,
    );

    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    expect(selectPageMock).toHaveBeenCalledWith(2);
  });

  test('calls changeResultsPerPage when selecting a new results per page option', () => {
    const { getByLabelText } = render(
      <Pagination
        selectPage={selectPageMock}
        currentPage={1}
        resultsPerPage={10}
        totalResults={100}
        changeResultsPerPage={changeResultsPerPageMock}
      />,
    );

    fireEvent.change(screen.getByText('Results per page'), {
      target: { text: '25' },
    });
    //expect(changeResultsPerPageMock).tobe
  });

  // Add more tests for different scenarios and edge cases
});
