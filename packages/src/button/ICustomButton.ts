export interface IButtonProps {
  clickHandler: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  showIcon?: boolean;
}

export interface IButtonWithLabelProps {
  clickHandler: (event: any) => void;
  label: string | number;
}
