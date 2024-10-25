import { IActions } from './IActions';
import Dropdown from 'react-bootstrap/Dropdown';
import './Actions.css';

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
        className={`${customCssToggleBtn ?? 'custom-action-btn'}`}
        disabled={disable}
      >
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu className={`${customCssMenu ?? 'custom-action-menu'}`}>
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
