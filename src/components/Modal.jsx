import { useEffect, useId, useRef } from "react";

/** Native dialog supplies focus containment, background inertness and focus return. */
export default function Modal({ open, onClose, title, children, className = "" }) {
  const ref = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (!open) return;
    const previous = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog ref={ref} className={`modal ${className}`} aria-labelledby={titleId}
      data-lenis-prevent onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header className="modal__header">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="modal__close" onClick={onClose} autoFocus aria-label="Zatvori">✕</button>
      </header>
      {children}
    </dialog>
  );
}
