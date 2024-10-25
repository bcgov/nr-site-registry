//import React from 'react';
import { screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
//import { render } from '@/test-utils'
import { HorizontalScroller } from './HorizontalScroller';

describe('Test suite for HorizontalScroller', () => {
  it('should render HorizontalScroller disabled', () => {
    render(
      <HorizontalScroller isEnabled={false} title="scroller">
        Content
      </HorizontalScroller>,
    );

    expect(screen.queryByTitle('scroller')).not.toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  //The HorizontalScroller component is present for the screen width of <900px
  it('should render HorizontalScroller with no scrolling', () => {
    render(
      <div style={{ width: '1000px' }} className="test-class" title="scroller">
        <HorizontalScroller>Content</HorizontalScroller>
      </div>,
    );

    const scroller = screen.getByTitle('scroller');
    expect(scroller).toHaveClass('test-class');

    screen.getByText('Content');
    expect(screen.queryByTitle('Scroll left')).not.toBeInTheDocument();
    expect(screen.queryByTitle('Scroll right')).not.toBeInTheDocument();
  });

  it('should render HorizontalScroller with scrolling', async () => {
    // jsdom doesn't supper scrollWidth/clientWidth - need to mock these
    const clientWidthMock = jest
      .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
      .mockImplementation(() => 100);
    const scrollWidthMock = jest
      .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
      .mockImplementation(() => 300);

    // Mocking scrollTo method
    const scrollToMock = jest.fn();
    HTMLElement.prototype.scrollTo = scrollToMock;

    render(
      <div style={{ width: '100px', height: '20px' }}>
        <HorizontalScroller title="scroller" className="test-class">
          <div style={{ width: '300px', height: '20px' }}>Content</div>
        </HorizontalScroller>
      </div>,
    );

    expect(screen.getByText('Content')).toBeInTheDocument();

    const scroller = screen.getByTitle('scroller');
    expect(scroller).toHaveClass('test-class');

    const scrollRight = await screen.findByTitle('Scroll right');
    expect(screen.queryByTitle('Scroll left')).not.toBeInTheDocument();
    await userEvent.click(scrollRight);

    const scrollLeft = await screen.findByTitle('Scroll left');
    expect(screen.queryByTitle('Scroll left')).toBeInTheDocument();

    await userEvent.click(scrollLeft);

    clientWidthMock.mockRestore();
    scrollWidthMock.mockRestore();
    scrollToMock.mockRestore();
  });
});
