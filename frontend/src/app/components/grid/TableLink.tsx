import { ReactNode } from 'react';
import { Link } from 'react-router-dom';

const layoutClassNames = new Set([
  'justify-content-center',
  'justify-content-end',
  'align-items-center',
  'gap-1',
]);

// Column config still names page-specific text classes. Those classes disagree
// with each other, so a table link keeps only layout utilities.
export function tableCellLinkClassName(extra?: string): string {
  const layout = (extra ?? '')
    .split(/\s+/)
    .filter((name) => layoutClassNames.has(name));
  return ['table-cell-link', ...layout].join(' ');
}

type TableLinkState = {
  fromPath: string;
  fromLabel: string;
};

type TableLinkProps = {
  to: string;
  label: string;
  value: string;
  text?: ReactNode;
  icon?: ReactNode;
  className?: string;
  state?: TableLinkState;
};

export function TableLink({
  to,
  label,
  value,
  text,
  icon,
  className,
  state,
}: TableLinkProps) {
  return (
    <Link
      to={to}
      className={tableCellLinkClassName(className)}
      aria-label={`${label} ${value}`}
      state={state}
    >
      {icon ? icon : null} <span className="ps-1">{text ?? value}</span>
    </Link>
  );
}
