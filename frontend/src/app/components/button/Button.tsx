import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'icon';
export type ButtonIntent = 'default' | 'danger' | 'success';
export type ButtonSize = 'small' | 'medium' | 'large';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ButtonSize;
  variant?: ButtonVariant;
  intent?: ButtonIntent;
  active?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      intent = 'default',
      className,
      active = false,
      ...props
    },
    ref,
  ) => {
    const variantCssClass = variant === 'icon' ? 'btn-icon' : variant;
    return (
      <button
        ref={ref}
        className={clsx([
          'SITE-Button',
          variantCssClass,
          size,
          intent !== 'default' && intent,
          active && 'btn-active',
          className,
        ])}
        {...props}
      />
    );
  },
);
