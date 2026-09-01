import React from 'react';
import './NavigationPills.css';
import { INavigationPills } from './INavigationPills';
import { useLocation, useNavigate } from 'react-router-dom';
import Actions from '../../action/Actions';
import { Button } from '../../button/Button';
import useMediaQuery from '../../../hooks/useMediaQuery';

const getTabFromPathname = (
  pathname: string,
  tabs: { value: string }[] | undefined,
) => {
  const segment = pathname.split('/').filter(Boolean).pop() ?? '';
  return tabs?.some((tab) => tab.value === segment) ? segment : '';
};

const NavigationPills: React.FC<INavigationPills> = ({
  components,
  isDisable,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobileScreen = useMediaQuery('(max-width: 786px)');
  const activeTabKey = getTabFromPathname(location.pathname, components);

  const getCurrentElementIndex = () =>
    components?.findIndex((tab) => tab?.value === activeTabKey) ?? -1;

  const handlePillClick = (tabKey: string) => {
    if (isDisable || !tabKey || tabKey === activeTabKey) {
      return;
    }
    navigate({ pathname: tabKey, search: location.search });
  };

  const isActiveTabFirstPosition = () => getCurrentElementIndex() === 0;

  const isActiveTabLastPosition = () =>
    getCurrentElementIndex() + 1 === (components?.length ?? 0);

  const getNextElement = () => {
    const currentComponentindex = getCurrentElementIndex();
    return components?.[currentComponentindex + 1]?.value;
  };

  const getPreviousElement = () => {
    const currentComponentindex = getCurrentElementIndex();
    return components?.[currentComponentindex - 1]?.value;
  };

  return (
    <div className="pt-1">
      <div className="d-flex d-xxl-flex d-xl-flex gap-2 d-none">
        {components?.map((item) => (
          <Button
            size="small"
            disabled={Boolean(isDisable) && item?.value !== activeTabKey}
            variant={item?.value === activeTabKey ? 'primary' : 'tertiary'}
            onClick={() => handlePillClick(item?.value)}
            key={item?.value}
            aria-current={item?.value === activeTabKey ? 'page' : undefined}
          >
            {item.label}
          </Button>
        ))}
      </div>
      <div className="d-flex d-xl-none d-lg-flex d-md-flex d-sm-flex d-xs-flex justify-content-between align-items-center w-100">
        <div className="d-flex justify-content-between w-100 flex-column flex-sm-row">
          <div>
            <Actions
              label="Select Page"
              items={components ?? []}
              onItemClick={
                isDisable ? () => {} : (value) => handlePillClick(value)
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
                  className={`custom-nav-carousel-left-icon ${isActiveTabFirstPosition() ? 'd-none' : ''}`}
                  aria-hidden="true"
                  onClick={
                    isDisable
                      ? () => {}
                      : () =>
                          !isActiveTabFirstPosition() &&
                          handlePillClick(getPreviousElement() ?? '')
                  }
                ></span>
              </div>
              <div className="ps-3 pe-2 m-0 p-0 w-100 text-center">
                {components?.map(
                  (tab) =>
                    tab?.value === activeTabKey && (
                      <Button
                        size={isMobileScreen ? 'medium' : 'small'}
                        className="custom-nav-pill"
                        key={tab?.value}
                        aria-current="page"
                      >
                        {tab?.label}
                      </Button>
                    ),
                )}
              </div>
              <div className="m-0">
                <span
                  className={`custom-nav-carousel-right-icon m-0 ${isActiveTabLastPosition() ? 'd-none' : ''}`}
                  aria-hidden="true"
                  onClick={
                    isDisable
                      ? () => {}
                      : () =>
                          !isActiveTabLastPosition() &&
                          handlePillClick(getNextElement() ?? '')
                  }
                ></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationPills;
