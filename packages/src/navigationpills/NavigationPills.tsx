import React, { useEffect, useState } from 'react';
import './NavigationPills.css';
import { INavigationPills } from './INavigationPills'; // Importing type definition for the props
import { useLocation } from 'react-router-dom'; // Importing React Router for navigation and location tracking
import Actions from '../action'; // Importing Actions component (likely for dropdown functionality)
import { Button } from '../button';
import useMediaQuery from './useMediaQuery';

const NavigationPills: React.FC<INavigationPills> = ({
  // Destructuring the props passed to the component
  items, // Array of pill items (text labels for the pills)
  components, // Array of custom components to display on active pill click
  dropdownItems, // Optional dropdown items to display in a dropdown menu
  isDisable, // Boolean to disable interaction with the pills
  customDropdownMenuCss, // Custom CSS for dropdown menu
  customDropdownToggleBtnCss, // Custom CSS for the dropdown toggle button
  customNavCarouselLeftIconCss, // Custom CSS for the left carousel icon
  customNavCarouselRightIconCss, // Custom CSS for the right carousel icon
}) => {
  const isMobileScreen = useMediaQuery('(max-width: 786px)');
  // State to track the currently active pill index
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // Get current location from React Router to handle URL changes
  const location = useLocation();
  // Effect to sync the active pill based on the URL search query (e.g., `?componentKey`)
  useEffect(() => {
    // Check if there is a search query in the URL
    if (location?.search !== '') {
      // Find the index of the component based on the URL query string
      const componentIndex = components.findIndex(
        (item: any) => item.key === location?.search.replace('?', ''), // Compare the query string to component keys
      );

      // If a valid component index is found, set it as the active index
      if (componentIndex > -1) {
        handlePillClick(componentIndex);
      }
    }
  }, [location]); // Depend on location, so the effect reruns when the location changes

  // Function to handle pill click and update the active index
  const handlePillClick = (index: number) => {
    setActiveIndex(index); // Set the clicked pill as active
  };

  return (
    <div className="pt-5">
      {/* Desktop view navigation pills */}
      <div className="d-flex d-xxl-flex d-xl-flex gap-2 d-none">
        {/* Map through each item in the 'items' array and render a Link component for each pill */}
        {items.map((item, index) => (
          <Button
            size="small"
            disabled={isDisable && index !== activeIndex}
            variant={index === activeIndex ? 'primary' : 'tertiary'}
            onClick={() => handlePillClick(index)}
          >
            {item}
          </Button>
        ))}
      </div>

      {/* Mobile view for navigation pills and carousel-style navigation */}
      <div className="d-flex d-xl-none d-lg-flex d-md-flex d-sm-flex d-xs-flex justify-content-between px-2 align-items-center w-100">
        <div className="d-flex justify-content-between w-100 flex-column flex-sm-row">
          <div>
            {/* Actions component, likely for displaying a dropdown */}
            <Actions
              label="Select Page"
              items={dropdownItems} // Pass dropdown items to the Actions component
              onItemClick={
                isDisable ? () => {} : (_, index) => handlePillClick(index)
              } // Handle dropdown item click
              customCssToggleBtn={`${customDropdownToggleBtnCss ? customDropdownToggleBtnCss : 'custom-nav-btn'}`} // Custom button styles
              customCssMenu={`${customDropdownMenuCss ? customDropdownMenuCss : 'custom-nav-action-menu'}`} // Custom menu styles
              disable={isDisable} // Disable interaction if needed
              toggleButtonVariant={'secondary'}
              toggleButtonSize={isMobileScreen ? 'medium' : 'small'}
            />
          </div>

          <div>
            {/* Carousel-like navigation for pills in mobile view */}
            <div className="d-flex align-items-center">
              {/* Left carousel icon */}
              <div className="m-0">
                <span
                  className={`${customNavCarouselLeftIconCss ? customNavCarouselLeftIconCss : `custom-nav-carousel-left-icon ${activeIndex === 0 ? 'd-none' : ''}`}`}
                  aria-hidden="true"
                  // Handle left icon click to navigate to the previous pill
                  onClick={
                    isDisable
                      ? () => {} // Do nothing if pills are disabled
                      : () =>
                          activeIndex > 0 && handlePillClick(activeIndex - 1) // Go to the previous pill if not at the start
                  }
                ></span>
              </div>

              <div className="ps-3 pe-2 m-0 p-0 w-100 text-center">
                {/* Map through items to show the currently active pill in the mobile carousel */}
                {items.map(
                  (item, index) =>
                    index === activeIndex && (
                      <Button
                        size={isMobileScreen ? 'medium' : 'small'}
                        className="custom-nav-pill"
                      >
                        {item}
                      </Button>
                    ),
                )}
              </div>

              {/* Right carousel icon */}
              <div className="m-0">
                <span
                  className={`${customNavCarouselRightIconCss ? customNavCarouselRightIconCss : `custom-nav-carousel-right-icon m-0 ${activeIndex === items.length - 1 ? 'd-none' : ''}`}`}
                  aria-hidden="true"
                  // Handle right icon click to navigate to the next pill
                  onClick={
                    isDisable
                      ? () => {} // Do nothing if pills are disabled
                      : () =>
                          activeIndex < items.length - 1 &&
                          handlePillClick(activeIndex + 1) // Go to the next pill if not at the end
                  }
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the active component based on the active index */}
      <div className="mt-4">
        {components &&
          components?.map((tabComponent: any, index: number) =>
            // Only render the component corresponding to the active pill index
            index === activeIndex ? (
              <div key={index}>{tabComponent.component}</div>
            ) : null,
          )}
      </div>
    </div>
  );
};

export default NavigationPills; // Export the NavigationPills component
