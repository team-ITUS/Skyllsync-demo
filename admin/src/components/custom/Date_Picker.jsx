import React, { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "./Table_DatePicker.css";
import "./Date_Picker.css"
import { right } from "@popperjs/core";

// Custom input to control placeholder styling and icon positioning
const CustomInput = forwardRef(({
  value,
  onClick,
  placeholder,
  fontSize,
  fontWeight
}, ref) => (
  <div className="dd-mm-yyyy-parent position-relative" style={{ padding: 0 }}>
    <input
      ref={ref}
      value={value || ''}
      onClick={onClick}
      placeholder={placeholder}
      style={{
        width: '100%',
        padding: '10px 40px 10px 20px',
        borderRadius: '40px',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: fontSize || '16px',
        fontWeight: fontWeight || '400',
        color: 'rgba(0,0,0,0.6)',
      }}
      readOnly
    />
    <img
      src="uiw_date.svg"
      alt="calendar"
      className="custom-date-icon"
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        right: '15px',
        transform: 'translateY(-50%)',
        width: '20px',
        height: '20px',
        cursor: 'pointer',
        pointerEvents: 'none'
      }}
    />
    
  </div>
));

const Date_Picker = ({
  label = "",
  value,
  onChange,
  placeholder = "dd-mm-yyyy",
  dateFormat = "dd-MM-yyyy",
  fontSize = "14px",
  fontWeight,
  minYear = new Date().getFullYear()-100,
  maxYear = new Date().getFullYear()+10,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>

      {label && (
        <p className="m-1" style={{ margin: 0, fontWeight: 500, fontSize: '14px' }}>
          {label}
        </p>
      )}

      <div className="mt-2">
        <DatePicker
        selected={value}
        onChange={date => { onChange(date); setOpen(false); }}
        open={open}
        onClickOutside={() => setOpen(false)}
        onInputClick={() => setOpen(true)}
        dateFormat={dateFormat}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        scrollableYearDropdown
        yearDropdownItemNumber={maxYear - minYear + 1}
        minDate={new Date(minYear, 0, 1)}
        maxDate={new Date(maxYear, 11, 31)}
        placeholderText={placeholder}
        customInput={
          <CustomInput
            fontSize={fontSize}
            fontWeight={fontWeight}
            placeholder={placeholder}
          />
        }
        renderCustomHeader={({
          date,
          changeMonth,
          changeYear,
          decreaseMonth,
          increaseMonth,
        }) => {
          const years = [];
          for (let y = maxYear; y >= minYear; y--) {
            years.push(y);
          }
          const months = [
            "JAN","FEB","MAR","APR","MAY","JUN",
            "JUL","AUG","SEP","OCT","NOV","DEC"
          ];
          return (
            <div
              style={{
                marginRight: 8,
                marginLeft: 8,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <button style={{width: "20px",border: "none"}} onClick={(e)=>{e.preventDefault(); decreaseMonth();}}>&lt;</button>
              

              <select
                value={date.getMonth()}
                onChange={e => changeMonth(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  height: "1.5em",
                  appearance: "none",
                }}
              >
                {months.map((m, i) => (
                  <option key={m} value={i}>&nbsp;{m}&nbsp;</option>
                ))}
              </select>

              <select
                value={date.getFullYear()}
                onChange={e => changeYear(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "15px",
                  fontWeight: 500,
                  height: "1.5em",
                  appearance: "none",
                }}
              >
                {years.map(y => (
                  <option key={y} value={y}>&nbsp;{y}&nbsp;</option>
                ))}
              </select>

              <button style={{width: "20px",border: "none"}} onClick={(e)=>{e.preventDefault(); increaseMonth();}}>&gt;</button>
            </div>
          );
        }}
      />
      </div>
    </div>
  );
};

export default Date_Picker;
