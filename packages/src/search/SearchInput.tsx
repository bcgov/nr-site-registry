import { useState } from 'react';
import { ISearchInput } from './ISearchInput';
import './SearchInput.css';
import React from 'react';
import { v4 } from 'uuid';

const SearchInput: React.FC<ISearchInput> = ({
  label, // Optional label for the search input
  searchTerm, // The current search term entered by the user
  handleSearchChange, // Function to handle changes to the search input field
  clearSearch, // Function to clear the search input
  options, // Optional list of search options to display in a dropdown
  optionSelectHandler, // Function to handle the selection of a search option
  createNewLabel, // Optional label for creating a new item (e.g., "Create New Category")
  createNewHandler, // Function to handle the creation of a new item
  placeHolderText, // Placeholder text for the search input field
  customLeftIcon, // Optional custom left icon to be displayed inside the input
  customRightIcon, // Optional custom right icon to be displayed inside the input
}) => {
  const [createMode, SetCreateMode] = useState(false);
  const handler = optionSelectHandler ?? (() => {});
  const addNewHandler = createNewHandler ?? (() => {});

  const handleClose = () => {
    if (createMode) {
      SetCreateMode(false);
      clearSearch();
    } else {
      clearSearch();
    }
  };
  const searchId = label
    ? label.replace(/\s+/g, '_') + '_' + v4()
    : 'search_' + v4();
  return (
    <div>
      {label && (
        <label
          htmlFor={searchId}
          className="form-label custom-search-label"
          aria-labelledby={label}
        >
          {label}
        </label>
      )}
      <div className="search-box-container">
        <div className="d-flex align-items-center w-100 position-relative search-box ">
          {!createMode && searchTerm.trim().length < 1 && (
            <span id="search-icon" className="custom-icon px-2">
              {customLeftIcon && customLeftIcon}
            </span>
          )}
          <input
            id={searchId}
            data-testid={searchId}
            aria-label={label}
            onChange={(event) => {
              handleSearchChange(event);
            }}
            placeholder={placeHolderText}
            value={searchTerm}
            type="text"
            className={`no-border-shadow-outline form-control custom-search ${
              searchTerm.length > 0 ? 'ps-2' : ''
            }`}
          />
          {!createMode && searchTerm.trim().length < 1 ? null : (
            <span
              data-testid="clear-icon"
              id="clear-icon"
              className="clear-icon custom-icon position-absolute px-2"
              onClick={handleClose}
            >
              {customRightIcon && customRightIcon}
            </span>
          )}

          {searchTerm && !createMode && options && options.length > 0 && (
            <div className="search-options">
              {options.map((option, index) => {
                return (
                  <div
                    key={index}
                    className="search-option-item"
                    onClick={() => {
                      handler(option);
                      handleClose();
                    }}
                  >
                    {option}
                  </div>
                );
              })}
              {createNewLabel && (
                <div
                  className="search-create-new-section"
                  onClick={() => {
                    SetCreateMode(true);
                  }}
                >
                  <span>+</span> <span>Create New {createNewLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>
        {createMode && createNewLabel && (
          <div
            className="search-add-new"
            onClick={() => {
              addNewHandler(searchTerm);
            }}
          >
            Add {createNewLabel}
          </div>
        )}
      </div>
    </div>
  );
};

//export default
export default SearchInput;

//export named
// export {SearchInput};
