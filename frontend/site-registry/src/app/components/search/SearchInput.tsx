import { useState } from 'react';
import { CircleXMarkIcon, MagnifyingGlassIcon } from '../common/icon';
import { ISearchInput } from './ISearchInput';
import './SearchInput.css';

const SearchInput: React.FC<ISearchInput> = ({
  label,
  searchTerm,
  handleSearchChange,
  clearSearch,
  options,
  optionSelectHandler,
  createNewLabel,
  createNewHandler,
}) => {
  const handler =
    optionSelectHandler ??
    ((e) => {
      console.log('handle option select');
    });

  const addNewHandler =
    createNewHandler ??
    ((e) => {
      console.log('Handle create new from search');
    });

  const [createMode, SetCreateMode] = useState(false);

  const handleClose = () => {
    if (createMode) {
      SetCreateMode(false);
      clearSearch();
    } else {
      clearSearch();
    }
  };

  return (
    <div>
      {label && (
        <label
          htmlFor={label}
          className="form-label custom-search-label"
          aria-labelledby={label}
        >
          {label}
        </label>
      )}
      <div className="search-box-container">
        <div className="d-flex align-items-center justify-content-center w-100 position-relative">
          <input
            id={label}
            aria-label={label}
            onChange={(event) => {
              handleSearchChange(event);
            }}
            value={searchTerm}
            type="text"
            className={`form-control custom-search ${
              searchTerm.length > 0 ? 'ps-2' : 'ps-5'
            }`}
          />
          {!createMode && searchTerm.length <= 0 ? (
            <span
              id="search-icon"
              className="search-icon custom-icon position-absolute px-2"
            >
              <MagnifyingGlassIcon />
            </span>
          ) : (
            <span
              id="clear-icon"
              className="clear-icon custom-icon position-absolute px-2"
              onClick={handleClose}
            >
              <CircleXMarkIcon />
            </span>
          )}

          {searchTerm && !createMode && options && options.length > 0 && (
            <div className="search-options">
              {options.map((option) => {
                return (
                  <div
                    className="search-option-item"
                    onClick={(e) => {
                      handler(option);
                      handleClose();
                    }}
                  >
                    {option}
                  </div>
                );
              })}
              <div
                className="search-create-new-section"
                onClick={(e) => {
                  SetCreateMode(true);
                }}
              >
                <span>+</span> <span>Create New {createNewLabel}</span>
              </div>
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

export default SearchInput;
