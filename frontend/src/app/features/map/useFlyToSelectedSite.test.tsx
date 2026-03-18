import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useFlyToSelectedSite } from './useFlyToSelectedSite';

jest.mock('./mapOptions', () => ({
  getZoom: () => 12,
  MAP_FLY_OPTIONS: {},
}));

describe('useFlyToSelectedSite', () => {
  it('flies once then resets and flies again after selectedSiteId cleared', () => {
    const flyTo = jest.fn();
    const map = { flyTo, getZoom: () => 10 };

    const { rerender } = renderHook(
      ({ id, lat, lng }: { id: string | null; lat?: number; lng?: number }) => {
        const ref = useRef(map as any);
        ref.current = map as any;
        useFlyToSelectedSite(ref, id, lat, lng);
      },
      { initialProps: { id: '5' as string | null, lat: 49, lng: -123 } },
    );

    expect(flyTo).toHaveBeenCalledWith({ lat: 49, lng: -123 }, 12, {});

    flyTo.mockClear();
    rerender({ id: null, lat: undefined, lng: undefined });
    rerender({ id: '5', lat: 49, lng: -123 });
    expect(flyTo).toHaveBeenCalledTimes(1);
    expect(flyTo).toHaveBeenCalledWith({ lat: 49, lng: -123 }, 12, {});
  });

  it('does not fly twice for same selectedSiteId when only lat changes', () => {
    const flyTo = jest.fn();
    const map = { flyTo, getZoom: () => 10 };

    const { rerender } = renderHook(
      ({ lat }: { lat: number }) => {
        const ref = useRef(map as any);
        ref.current = map as any;
        useFlyToSelectedSite(ref, '7', lat, -120);
      },
      { initialProps: { lat: 50 } },
    );

    expect(flyTo).toHaveBeenCalledTimes(1);
    rerender({ lat: 51 });
    expect(flyTo).toHaveBeenCalledTimes(1);
  });

  it('does not fly when map ref is null', () => {
    const flyTo = jest.fn();
    renderHook(() => {
      const ref = useRef(null);
      useFlyToSelectedSite(ref, '1', 49, -123);
    });
    expect(flyTo).not.toHaveBeenCalled();
  });
});
