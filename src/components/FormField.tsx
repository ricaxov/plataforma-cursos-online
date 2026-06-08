import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, required, className = '', children }: FormFieldProps) {
  return (
    <div className={`mb-3 ${className}`}>
      <label className="form-label" htmlFor={htmlFor}>
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
}
