export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{label}</span>
      </div>
      <p className="text-muted mt-2 mb-0">{label}</p>
    </div>
  );
}
