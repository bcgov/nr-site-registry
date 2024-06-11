import { CircleXMarkIcon, MagnifyingGlassIcon } from "../common/icon";
import { ISearchInput } from "./ISearchInput";
import './SearchInput.css';

const SearchInput: React.FC<ISearchInput> = ({ label, searchTerm, handleSearchChange, clearSearch }) => {
    return (
        <>
            {label && <label htmlFor={label} className="form-label custom-search-label" aria-labelledby={label}>{label}</label>}
            <div className="d-flex align-items-center justify-content-center w-100 position-relative">
                <input
                id={label}
                aria-label={label}
                onChange={(event) => {handleSearchChange(event)}}
                value={searchTerm}
                type="text"
                className={`form-control custom-search ${searchTerm.length > 0 ? 'ps-2' : 'ps-5'}`}
                />
                {
                searchTerm.length <= 0  
                    ? 
                    <span id="search-icon" className="search-icon custom-icon position-absolute px-2"><MagnifyingGlassIcon/></span>
                    :  
                    <span id="clear-icon" className="clear-icon custom-icon position-absolute px-2" onClick={clearSearch} ><CircleXMarkIcon  /></span>
                }
            </div>
        </>
    );
  };
  
  export default SearchInput;