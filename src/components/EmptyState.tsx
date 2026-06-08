interface EmptyStateProps {
  icon?: string;
  message: string;
}

export function EmptyState({ icon = 'bi-inbox', message }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} />
      <p>{message}</p>
    </div>
  );
}
