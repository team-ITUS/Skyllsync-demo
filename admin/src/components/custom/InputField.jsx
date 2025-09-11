import React, { useRef } from "react";
// import "./Table_DatePicker.css";
import "./SharedForm.css";

const InputField = ({
  label = "",
  type = "text",
  value,
  onChange,
  placeholder = "",
  options = [],
  icon = null, // for file input
  hidePlaceholder = false, // when true (for selects) suppress disabled placeholder so first option (e.g. 'All') is selectable & visible
  ...rest
}) => {
  const fileInputRef = useRef(null);

  // Custom select arrow removed via CSS below
  if (type === "select") {
    return (
      <div className="name-parent">
        {label && <label className="field-label">{label}</label>}
        <div className="dd-mm-yyyy-parent mt-2" style={{padding: 0}}>
          <select
            className="custom-date-input"
            style={{

              border: "none",
              outline: "none",
              background: "transparent",
              width: "100%",
              height: "100%",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              fontSize: "14px",
              color: "rgba(0,0,0,0.6)",
              borderRadius: "40px",
              margin: "2px 2px",
              padding: "5px 20px",
              cursor: "pointer"
            }}
            value={value}
            onChange={(e)=> onChange(e.target.value)}
            {...rest}
          >
            {!hidePlaceholder && (
              <option value="" disabled>
                {placeholder || "Select"}
              </option>
            )}
            {options.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  if (type === "file") {
    return (
      <div className="name-parent">
        {label && <label className="field-label">{label}</label>}
        <div
          className="dd-mm-yyyy-parent mt-2"
          style={{ cursor: "pointer", position: "relative" }}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={onChange}
            {...rest}
          />
          <span
            className="custom-date-input"
            style={{

              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              margin: "2px 2px",
              color: "rgba(0,0,0,0.6)",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {value && value.name ? value.name : placeholder || "Select file"}
          </span>
          <img
            src={icon || "clarity_attachment-line.svg"}
            alt="attach"
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              width: 20,
              height: 20,
              pointerEvents: "none"
            }}
          />
        </div>
      </div>
    );
  }

  // Default: text, number, etc.
return (
    <div className="name-parent">
      {label && <label style={{fontSize: "14px"}}>{label}</label>}
      <div className="dd-mm-yyyy-parent mt-2" style={{padding: 0}}>
        <input
          type={type}
          className="custom-date-input"
          style={{

            border: "none",
            outline: "none",
            background: "transparent",
            width: "100%",
            height: "100%",
            fontSize: "14px",
            margin: "2px 2px",
            color: "rgba(0,0,0,0.6)",
            borderRadius: "40px",
            padding: "10px 20px"
          }}
          value={value}
          onChange={(e)=> onChange(e.target.value)}
          placeholder={placeholder}
          {...rest}
        />
      </div>
    </div>
  );
};

export default InputField;