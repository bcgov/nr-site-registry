import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

import './Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: 'small' | 'medium';
  variant?: ButtonVariant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'medium', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(['SITE-Button', variant, size, className])}
        {...props}
      />
    );
  },
);
