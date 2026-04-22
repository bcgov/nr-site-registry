import { IActions } from './IActions';
import Dropdown from 'react-bootstrap/Dropdown';
import './Actions.css';
import { DropdownIcon } from '../common/icon';
import { Button } from '../button/Button';
import { isValidElement } from 'react';

const Actions: React.FC<IActions> = ({
  label,
  items,
  disable,
  customCssMenu,
  customCssMenuItem,
  customCssToggleBtn,
  onItemClick,
  toggleButtonVariant,
  toggleButtonSize,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-action"
        as={Button}
        className={`${customCssToggleBtn ?? ''} d-flex align-items-center gap-1`}
        disabled={disable}
        variant={toggleButtonVariant}
        // @ts-expect-error We're passing the size prop to the Button component (`as` prop),
        // which is not compatible with the Dropdown.Toggle `size` prop
        size={toggleButtonSize}
      >
        {label}
        <DropdownIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu
        className={`${customCssMenu ?? 'custom-action-menu'}`}
        align={'end'}
      >
        {items?.map((item, index) => {
          if (!isValidElement(item) && 'value' in item) {
            const isDangerAction = item.danger === true;
            const itemClassName = `disable w-100 ${customCssMenuItem ?? 'custom-action-item'} ${isDangerAction ? 'custom-action-item-danger' : ''}`;

            return (
              <Dropdown.Item
                key={index}
                onClick={() => onItemClick(item.value, index)}
                className={itemClassName}
              >
                {item.label}
              </Dropdown.Item>
            );
          }
          return (
            <Dropdown.Item
              key={index}
              className={`disable w-100 ${customCssMenuItem ?? 'custom-action-item'}`}
            >
              {item}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Actions;
