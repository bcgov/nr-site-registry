import React, { useEffect, useState } from 'react';
import './NavigationPills.css';
import { INavigationPills } from './INavigationPills';
import { Link, useLocation } from 'react-router-dom';
import Actions from '../../action/Actions';
import { Button } from '../../button/Button';
import useMediaQuery from '../../../hooks/useMediaQuery';

const NavigationPills: React.FC<INavigationPills> = ({
  items,
  components,
  dropdownItems,
  isDisable,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const location = useLocation();

  const isMobileScreen = useMediaQuery('(max-width: 786px)');

  useEffect(() => {
    if (location?.search !== '') {
      const componentIndex = components.findIndex(
        (item: any) => item.key === location?.search.replace('?', ''),
      );

      if (componentIndex > -1) {
        handlePillClick(componentIndex);
      }
    }
  }, [location]);

  const handlePillClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="pt-5">
      <div className="d-flex d-xxl-flex d-xl-flex gap-2 d-none">
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
      <div className="d-flex d-xl-none d-lg-flex d-md-flex d-sm-flex d-xs-flex justify-content-between align-items-center w-100">
        <div className="d-flex justify-content-between w-100 flex-column flex-sm-row">
          <div>
            <Actions
              label="Select Page"
              items={dropdownItems}
              onItemClick={
                isDisable ? () => {} : (value, index) => handlePillClick(index)
              }
              customCssToggleBtn={'custom-nav-btn'}
              customCssMenu={'custom-nav-action-menu'}
              disable={isDisable}
              toggleButtonVariant={'secondary'}
              toggleButtonSize={isMobileScreen ? 'medium' : 'small'}
            />
          </div>
          <div>
            <div className="d-flex align-items-center">
              <div className="m-0">
                <span
                  className={`custom-nav-carousel-left-icon ${activeIndex === 0 ? 'd-none' : ''}`}
                  aria-hidden="true"
                  onClick={
                    isDisable
                      ? () => {}
                      : () =>
                          activeIndex > 0 && handlePillClick(activeIndex - 1)
                  }
                ></span>
              </div>
              <div className="ps-3 pe-2 m-0 p-0 w-100 text-center">
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
              <div className="m-0">
                <span
                  className={`custom-nav-carousel-right-icon m-0 ${activeIndex === items.length - 1 ? 'd-none' : ''}`}
                  aria-hidden="true"
                  onClick={
                    isDisable
                      ? () => {}
                      : () =>
                          activeIndex < items.length - 1 &&
                          handlePillClick(activeIndex + 1)
                  }
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4">
        {components &&
          components?.map((tabComponent: any, index: number) =>
            index === activeIndex ? (
              <div key={index}>{tabComponent.component}</div>
            ) : null,
          )}
      </div>
    </div>
  );
};

export default NavigationPills;
