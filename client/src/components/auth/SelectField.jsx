export default function SelectField({
  id, 
  label, 
  value, 
  onChange, 
  options, 
  icon: Icon, 
  accentColor
}) {
  return (
    <div>
      <label htmlFor={id} style={{ fontSize: "0.875rem", fontWeight: 500, color: "#374151" }}>
        {label}
      </label>
      <div className="mt-1.5 relative">
        
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
        
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full outline-none transition-all rounded-xl appearance-none"
          style={{
            paddingLeft: Icon ? "2.75rem" : "1rem",
            paddingRight: "2.5rem",
            paddingTop: "0.75rem",
            paddingBottom: "0.75rem",
            border: "1.5px solid #E2E8F0",
            fontSize: "0.9375rem",
            color: value ? "#0F172A" : "#94A3B8",
            background: "#FAFAFA",
            cursor: "pointer"
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
        >
          <option value="" disabled>Select {label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ color: "#0F172A" }}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Dropdown Arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
    </div>
  );
}