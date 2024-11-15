
export interface IButtonProps {
    clickHandler: (event: React.MouseEvent<HTMLDivElement>) => void;
    label?: string;
    showIcon?: boolean;
  }
  
export interface IButtonWithLabelProps {
    clickHandler: (event: any) => void;
    label: string | number;
  }