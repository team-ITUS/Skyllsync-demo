import React from "react";
import "./Table_DatePicker.css";

const CustomTable = ({
  columns = [],
  rows = [],
  renderAction = null,
}) => (
  <div className="table-responsive mt-4 rounded-table-wrapper">
    <table className="table table-bordered table-hover align-middle text-center custom-table">
      <thead>
        <tr>
          {columns.map((col, idx) => (
            <th key={idx}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            // style={{
            //   backgroundColor:
            //     rowIndex % 2 === 0
            //       ? "rgba(235, 162, 53, 0.72)"
            //       : "rgba(235, 162, 53, 0.62)",
            // }}
          >
            {columns.map((col, colIndex) => {
              if (col === "Action" && renderAction) {
                return (
                  <td key={colIndex} className="position-relative">
                    {renderAction(rowIndex)}
                  </td>
                );
              }
              return <td key={colIndex}>{row[col] || "-"}</td>;
            })}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CustomTable;