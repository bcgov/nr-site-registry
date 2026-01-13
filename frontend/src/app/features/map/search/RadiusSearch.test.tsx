import { render, screen, fireEvent } from '@testing-library/react';
import { RadiusSearch } from './RadiusSearch';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';
import {
  MIN_CIRCLE_RADIUS,
  MAX_CIRCLE_RADIUS,
} from '../../../constants/Constant';

jest.mock('../mapSearchContext/MapSearchContext');

describe('RadiusSearch component', () => {
  const mockHandleRadiusChange = jest.fn();
  const mockClearRadiusSearch = jest.fn();

  const renderComponent = (
    center: [number, number] | null,
    radius: number = MIN_CIRCLE_RADIUS,
    isSmall: boolean = false,
  ) => {
    (useMapSearchContext as jest.Mock).mockReturnValue({
      center,
      radius,
      handleRadiusChange: mockHandleRadiusChange,
      clearRadiusSearch: mockClearRadiusSearch,
    });
    return render(<RadiusSearch isSmall={isSmall} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the component', () => {
    renderComponent([49.2827, -123.1207]);
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeInTheDocument();
  });

  it('should render Set Radius button when center is valid', () => {
    renderComponent([49.2827, -123.1207]);
    const setRadiusButton = screen.getByText('Set Radius');
    expect(setRadiusButton).toBeInTheDocument();
  });

  it('should call clearRadiusSearch when Cancel button is clicked', () => {
    renderComponent([49.2827, -123.1207]);
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockClearRadiusSearch).toHaveBeenCalledTimes(1);
  });

  it('should disable controls when center is not valid', () => {
    renderComponent(null);
    const setRadiusButton = screen.getByText('Set Radius');
    expect(setRadiusButton).toBeDisabled();
  });

  it('should render radius input field', () => {
    const { container } = renderComponent(
      [49.2827, -123.1207],
      MIN_CIRCLE_RADIUS,
      true,
    );
    const input = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    expect(input).toBeInTheDocument();
  });

  it('should update input value when user types', () => {
    const { container } = renderComponent(
      [49.2827, -123.1207],
      MIN_CIRCLE_RADIUS,
      true,
    );
    const input = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2' } });
    expect(input.value).toBe('2');
  });

  it('should show error message for value below minimum radius', () => {
    const { container } = renderComponent(
      [49.2827, -123.1207],
      MIN_CIRCLE_RADIUS,
      true,
    );
    const input = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    fireEvent.change(input, { target: { value: '0.3' } }); // 300m < 500m minimum
    const errorMessages = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('Minimum radius is') ?? false;
    });
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  it('should show error message for value above maximum radius', () => {
    const { container } = renderComponent(
      [49.2827, -123.1207],
      MIN_CIRCLE_RADIUS,
      true,
    );
    const input = container.querySelector(
      'input[type="number"]',
    ) as HTMLInputElement;
    const maxKm = MAX_CIRCLE_RADIUS / 1000;
    fireEvent.change(input, { target: { value: (maxKm + 1).toString() } });
    const errorMessages = screen.getAllByText((content, element) => {
      return element?.textContent?.includes('Maximum radius is') ?? false;
    });
    expect(errorMessages.length).toBeGreaterThan(0);
  });
});
