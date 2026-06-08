import type { ReactNode } from 'react';

interface PageHeaderProps {
  icon: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h2>
          <i className={`bi ${icon} me-2`} />
          {title}
        </h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
