import { useCallback, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';

interface ConfirmState {
  message: string;
  onConfirm: () => void;
}

/**
 * Hook que fornece uma função `confirm(message, onConfirm)` e o elemento
 * `ConfirmElement` que deve ser renderizado na página.
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((message: string, onConfirm: () => void) => {
    setState({ message, onConfirm });
  }, []);

  const handleConfirm = () => {
    state?.onConfirm();
    setState(null);
  };

  const ConfirmElement = (
    <ConfirmDialog
      show={state !== null}
      message={state?.message ?? ''}
      onConfirm={handleConfirm}
      onCancel={() => setState(null)}
    />
  );

  return { confirm, ConfirmElement };
}
