export default function InputField({
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon,
  rightElement, 
  autoComplete, 
  accentColor,
}) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
        {label}
      </label>
      <div className="mt-1.5 relative">
        {icon && icon({ className: "absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" })}
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full outline-none transition-all rounded-xl"
          style={{
            paddingLeft: "2.75rem",
            paddingRight: rightElement ? "3rem" : "1rem",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            border: "1.5px solid #E2E8F0",
            fontSize: "0.9375rem",
            color: "#0F172A",
            background: "#FAFAFA",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = accentColor;
            e.currentTarget.style.background = "white";
            e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}18`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
            e.currentTarget.style.background = "#FAFAFA";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
    </div>
  );
}