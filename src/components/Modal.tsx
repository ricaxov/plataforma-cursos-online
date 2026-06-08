import type { ReactNode } from 'react';

interface ModalProps {
  show: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg' | 'xl';
}

export function Modal({ show, title, onClose, children, footer, size }: ModalProps) {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show d-block" tabIndex={-1} role="dialog">
        <div className={`modal-dialog modal-dialog-centered ${size ? `modal-${size}` : ''}`}>
          <div className="modal-content">
            <div className="modal-header rp-modal-header">
              <h5 className="modal-title">{title}</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
            </div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose} />
    </>
  );
}
