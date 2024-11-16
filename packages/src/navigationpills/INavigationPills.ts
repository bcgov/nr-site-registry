export interface INavigationPills {
  // The 'items' property is a required array of strings,
  // representing the labels or names for each navigation pill.
  items: string[];

  // The 'dropdownItems' property is optional and can hold any type of data
  // (because it is typed as 'any'). It likely represents additional items
  // that should appear in a dropdown menu within the navigation pills.
  dropdownItems?: any;

  // The 'isDisable' property is optional and of type boolean.
  // If set to 'true', it will disable the navigation pills,
  // making them unclickable or non-interactive.
  isDisable?: boolean;

  // The 'components' property is optional and can hold any type of data.
  // It may represent custom components or elements that should be rendered
  // as part of the navigation pills, providing flexibility for complex content.
  components?: any;

  // The 'customDropdownToggleBtnCss' property is optional and expects a string.
  // It allows the application of custom styles to the button or icon that toggles the dropdown menu.
  customDropdownToggleBtnCss?: string;

  // The 'customDropdownMenuCss' property is optional and expects a string.
  // It allows customization of the CSS styles applied to the dropdown menu itself.
  customDropdownMenuCss?: string;

  // The 'customNavCarouselLeftIconCss' property is optional and expects a string.
  // It allows customization of the left arrow or icon used in a carousel or paginated navigation pill component.
  customNavCarouselLeftIconCss?: string;

  // The 'customNavCarouselRightIconCss' property is optional and expects a string.
  // It allows customization of the right arrow or icon used in a carousel or paginated navigation pill component.
  customNavCarouselRightIconCss?: string;
}
