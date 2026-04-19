export default function InputField({
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  icon: Icon, // 1. We declare it with a capital 'I' here
  rightElement, 
  autoComplete, 
  accentColor,
  disabled,
}) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
        {label}
      </label>
      <div className="mt-1.5 relative">
        
        {/* 2. We USE it with a capital 'I' here! This fixes the error. */}
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
        
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full outline-none transition-all rounded-xl"
          style={{
            paddingLeft: "2.75rem",
            paddingRight: rightElement ? "3rem" : "1rem",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            border: "1.5px solid #E2E8F0",
            fontSize: "0.9375rem",
            color: disabled ? "#94A3B8" : "#0F172A", 
            background: disabled ? "#F1F5F9" : "#FAFAFA",
            cursor: disabled ? "not-allowed" : "text",
            opacity: disabled ? 0.8 : 1
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