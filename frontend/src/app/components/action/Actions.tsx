import { IActions } from './IActions';
import Dropdown from 'react-bootstrap/Dropdown';
import './Actions.css';
import { DropdownIcon } from '../common/icon';
import { Button } from '../button/Button';

const Actions: React.FC<IActions> = ({
  label,
  items,
  disable,
  customCssMenu,
  customCssMenuItem,
  customCssToggleBtn,
  onItemClick,
  toggleButtonVariant = 'primary',
}) => {
  return (
    <Dropdown>
      <Dropdown.Toggle
        id="dropdown-action"
        as={Button}
        className={`${customCssToggleBtn ?? ''} d-flex align-items-center gap-1`}
        disabled={disable}
        variant={toggleButtonVariant}
      >
        {label}
        <DropdownIcon />
      </Dropdown.Toggle>
      <Dropdown.Menu
        className={`${customCssMenu ?? 'custom-action-menu'}`}
        align={'end'}
      >
        {items.map((item, index) => (
          <Dropdown.Item
            key={index}
            onClick={() => onItemClick(item.value, index)}
            className={`disable ${customCssMenuItem ?? 'custom-action-item'}`}
          >
            {item.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default Actions;
