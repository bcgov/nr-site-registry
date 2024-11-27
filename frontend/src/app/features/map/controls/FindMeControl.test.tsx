import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FindMeControl } from './FindMeControl'; // Adjust the import path as necessary
import { useGeolocationPermission } from '../../../../hooks/useMyLocation';

// Mock the useGeolocationPermission hook
jest.mock('../../../../hooks/useMyLocation');

describe('FindMeControl component', () => {
  const setLocationVisibleMock = jest.fn();

  const renderComponent = (state: string, isLocationVisible: boolean) => {
    (useGeolocationPermission as jest.Mock).mockReturnValue(state);
    render(
      <FindMeControl
        isLocationVisible={isLocationVisible}
        setLocationVisible={setLocationVisibleMock}
      />,
    );
  };

  it('should render the button when state is not "denied"', () => {
    renderComponent('granted', false);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should return null when state is "denied"', () => {
    renderComponent('denied', false);
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();
  });

  it('should call setLocationVisible handler when clicked', () => {
    renderComponent('granted', false);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(setLocationVisibleMock).toHaveBeenCalledTimes(1);
  });

  it('should display location when button is clicked', () => {
    renderComponent('granted', false);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    const location = screen.getByText('Show my location on the map');
    expect(location).toBeInTheDocument();
  });
});
