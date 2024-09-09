import { IActions } from './IActions';
import Dropdown from 'react-bootstrap/Dropdown';
import './Actions.css';
import { useEffect, useState } from 'react';
import { set } from 'date-fns';

const Actions: React.FC<IActions> = ({
  label,
  items,
  disable,
  customCssMenu,
  customCssMenuItem,
  customCssToggleBtn,
  onItemClick,
  showActions = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(showActions);
  }, [showActions]);
  return (
    <Dropdown show={isOpen} onToggle={()=> setIsOpen(!isOpen)}>
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
            onClick={() => {onItemClick(item.value, index); 
              setIsOpen(false);}} // Optionally close the dropdown on item click
            
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
