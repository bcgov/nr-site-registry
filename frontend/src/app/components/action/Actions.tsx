import { IActions } from './IActions';
import Dropdown from 'react-bootstrap/Dropdown';
import './Actions.css';
import { DropdownIcon } from '../common/icon';
import { isValidElement } from 'react';

const Actions: React.FC<IActions> = ({
  label,
  items,
  disable,
  customCssMenu,
  customCssMenuItem,
  customCssToggleBtn,
  onItemClick,
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        variant=""
        id="dropdown-action"
        className={`${customCssToggleBtn ?? 'custom-action-btn'} d-flex align-items-center gap-1`}
        disabled={disable}
      >
        {label}
        <DropdownIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu
        className={`${customCssMenu ?? 'custom-action-menu'}`}
        align={'end'}
      >
        {items.map((item, index) => {
          if (!isValidElement(item) && 'value' in item) {
            return (
              <Dropdown.Item
                key={index}
                onClick={() => onItemClick(item.value, index)}
                className={`disable ${customCssMenuItem ?? 'custom-action-item'}`}
              >
                {item.label}
              </Dropdown.Item>
            );
          }
          return (
            <Dropdown.Item
              key={index}
              className={`disable ${customCssMenuItem ?? 'custom-action-item'}`}
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
