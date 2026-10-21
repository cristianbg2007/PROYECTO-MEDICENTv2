function CampoTexto({ label, id, type = 'text', placeholder, required, value, onChange, step }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        type={type}
        step={step}
        id={id}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
      />
    </div>
  )
}

export default CampoTexto