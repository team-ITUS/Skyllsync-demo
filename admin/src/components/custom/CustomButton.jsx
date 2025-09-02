import React from "react";
import "./Table_DatePicker.css";
import "./CustomButton.css"

const CustomButton = ({
  title,
  icon = null,
  color = "#374174",
  onClick = () => {},
  variant = "solid",
  disabled = false,
}) => {
  // Build inline styles based on variant
  const style = {
    padding: 0,
    marginBottom: "-10px",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    backgroundColor: variant === "solid" ? color : "transparent",
    color: variant === "solid" ? "#fff" : color,
    border: variant === "outline" ? `1px solid ${color}` : "none",
  };

  return (
    <div
      className="custom-button-parent px-2"
      style={style}
      onClick={!disabled ? onClick : undefined}
    >
      {title ? <div className="custom-button ps-2" style={{fontSize:"16px", fontWeight: "400"}}>{title}</div>: <></>}
      {icon && (
        <img
          className="custom-icon"
          src={icon}
          alt="icon"
          style={title ? { marginLeft: 8 }: { marginLeft: 0 }}
        />
      )}
    </div>
  );
};

export default CustomButton;
