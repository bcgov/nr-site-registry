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
    const location = screen.getByTitle('Show my location on the map');
    expect(location).toBeInTheDocument();
  });

  it('should call useGeolocationPermission hook', () => {
    renderComponent('granted', false);
    expect(useGeolocationPermission).toHaveBeenCalled();
  });

  it('should have the correct classes when isLocationVisible is false', () => {
    renderComponent('granted', false);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('map-control-button');
    expect(button).not.toHaveClass('map-control-button--active');
  });

  it('should have the correct classes when isLocationVisible is true', () => {
    renderComponent('granted', true);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('map-control-button');
    expect(button).toHaveClass('map-control-button--active');
  });
});
