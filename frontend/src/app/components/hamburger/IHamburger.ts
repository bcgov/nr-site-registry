export interface HamburgerProps {
  isOpen: boolean;
  toggleNavbar: () => void;
  customHumburgerCss?: string; // Optional for additional styling
  customHumburgerContainerCss?: string; // Optional for additional styling
  customHumburgerLinesCss?: string; // Optional for additional styling
  ariaLabel?: string; // Optional aria-label for accessibility
  ariaExpanded?: boolean; // Change aria-expanded to boolean
  ariaControls?: string; // Optional aria-controls for accessibility
  ariaHasPopup?: any; // Optional aria-haspopup for accessibility
}
