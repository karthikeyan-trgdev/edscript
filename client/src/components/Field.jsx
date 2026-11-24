import '../styles/forms.css';

// Floating-label input / textarea / select used by the contact and registration forms.
export default function Field({ id, label, error, as = 'input', children, className = '', ...props }) {
  const Tag = as;
  const mods = [
    as === 'textarea' && 'field--area',
    as === 'select' && 'field--select',
    error && 'has-error',
    className,
  ].filter(Boolean).join(' ');
  return (
    <div className={`field ${mods}`}>
      <Tag
        id={id}
        name={id}
        className="field__input"
        placeholder={as === 'select' ? undefined : ' '}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        {...props}
      >
        {children}
      </Tag>
      <label htmlFor={id} className="field__label">{label}</label>
      {error && <span className="field__error" id={`${id}-err`} role="alert">{error}</span>}
    </div>
  );
}
