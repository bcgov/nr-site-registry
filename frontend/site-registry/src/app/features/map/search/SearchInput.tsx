import { MouseEventHandler } from 'react';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { TextFieldProps } from '@mui/material/TextField/TextField';
import clsx from 'clsx';

//import { LocationIconButton } from './LocationIconButton'

import {
  MagnifyingGlassIcon,
  CircleXMarkIcon,
} from '../../../components/common/icon';
//import CloseIcon from '@/assets/svgs/fa-close.svg?react'

import './SearchInput.css';

interface Props extends Omit<TextFieldProps, 'variant'> {
  showSearchIcon?: boolean;
  showClearIcon?: boolean;
  onClear?: MouseEventHandler<HTMLButtonElement>;
  showLocationIcon?: boolean;
}

export function SearchInput({
  value,
  onChange,
  showSearchIcon = true,
  showClearIcon = true,
  onClear,
  showLocationIcon = false,
  InputProps,
  placeholder = 'Search',
  className,
  size,
  ...rest
}: Readonly<Props>) {
  const startAdornment = showSearchIcon ? (
    <InputAdornment position="start">
      <MagnifyingGlassIcon
        title="Search icon"
        className="search-input-icon search-input-icon--search"
      />
    </InputAdornment>
  ) : null;

  const endAdornment =
    showClearIcon || showLocationIcon ? (
      <InputAdornment position="end">
        {showClearIcon && value ? (
          <IconButton
            onClick={onClear}
            title="Clear"
            className="search-input-clear-button"
          >
            <CircleXMarkIcon className="search-input-icon search-input-icon--close" />
          </IconButton>
        ) : null}
        {/* {showLocationIcon ? <LocationIconButton /> : null} */}
      </InputAdornment>
    ) : null;

  return (
    <TextField
      {...rest}
      value={value}
      onChange={onChange}
      InputProps={{
        ...InputProps,
        startAdornment,
        endAdornment,
        sx: {
          '& .MuiInputBase-input::placeholder': {
            fontSize: '16px !important', // Increase the font size of the placeholder
          },
        },
      }}
      placeholder={placeholder}
      variant="outlined"
      className={clsx(
        'search-input',
        size && `search-input--${size}`,
        className,
      )}
    />
  );
}
