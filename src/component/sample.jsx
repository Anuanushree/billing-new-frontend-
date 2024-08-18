import React, { useState } from "react";
import "./sample.css";

function Sample({ Base_url, formDetails, valueType }) {
  const [data, setData] = useState([]);
  const totalOpeningBottles = {};

  // console.log(formDetails);
  // Calculate total opening bottles for each size and range
  formDetails.forEach((item) => {
    const { Range, Size } = item;
    const value = item[valueType];
    if (!totalOpeningBottles[Range]) {
      totalOpeningBottles[Range] = {};
    }
    if (!totalOpeningBottles[Range][Size]) {
      totalOpeningBottles[Range][Size] = 0;
    }
    totalOpeningBottles[Range][Size] += value || 0;
  });

  const ranges = [...new Set(formDetails.map((item) => item.Range.trim()))];

  const sizes = [...new Set(formDetails.map((item) => item.Size))];

  const calculateTotalSaleValue = (productType) => {
    return formDetails
      .filter((item) => item.Range === productType)
      .reduce((total, item) => total + (item[valueType] || 0), 0);
  };

  const grandTotal =
    calculateTotalSaleValue("Beer") +
    calculateTotalSaleValue("Premium") +
    calculateTotalSaleValue("Ordinary") +
    calculateTotalSaleValue("Medium");

  const calculateAddt = (range, size) => {
    // console.log(range, size);
    // console.log(totalOpeningBottles[range][size]);
    if (
      totalOpeningBottles[range] &&
      totalOpeningBottles[range][size] !== undefined
    ) {
      const value = totalOpeningBottles[range][size];
      // console.log(size);
      if (size == 375 || size == 325 || size == 500) {
        // console.log(Math.round(value / 24), "cal value");
        return Math.round(value / 24);
      } else if (size == "650" || size == "750") {
        // console.log(size, value);
        return Math.round(value / 12);
      } else if (size == "180") {
        return Math.round(value / 48);
      } else if (size == "1000") {
        return Math.round(value / 9);
      } else {
        return 0;
      }
    }
    return 0;
  };
  console.log(ranges, "ranges");
  return (
    <div id="wrapper">
      {/* Table for total opening bottles based on size and range */}
      <div className="card-container">
        <div className="sub-card">
          <h3>{valueType}</h3>
          <table border="1">
            <thead>
              <tr>
                <th>Size</th>
                {ranges.map((range) => (
                  <th key={range}>{range}</th>
                ))}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {sizes
                .sort((a, b) => parseInt(b) - parseInt(a))
                .map((size) => (
                  <tr key={size}>
                    <td>{size}</td>
                    {ranges.map((range) => (
                      <td key={`${range}-${size}`}>
                        {totalOpeningBottles[range] &&
                        totalOpeningBottles[range][size]
                          ? totalOpeningBottles[range][size]
                          : 0}
                      </td>
                    ))}
                    <td>
                      {ranges.reduce((acc, range) => {
                        return (
                          ((totalOpeningBottles[range] &&
                            totalOpeningBottles[range][size]) ||
                            0) + acc
                        );
                      }, 0)}
                    </td>
                  </tr>
                ))}
              <tr>
                <th>Grand Total</th>
                {ranges.map((range) => (
                  <td key={`grand-${range}`}>
                    {calculateTotalSaleValue(range)}
                  </td>
                ))}
                <td>{grandTotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Table for total bottles divided by size quantity */}

      {valueType !== "Closing_value" && valueType !== "Sale_value" && (
        <div className="card-container">
          <div className="sub-card">
            <table border="1">
              <thead>
                <tr>
                  <th>Size</th>
                  {ranges.map((range) => (
                    <th key={range}>{range}</th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sizes
                  .sort((a, b) => parseInt(b) - parseInt(a))
                  .map((size) => (
                    <tr key={size}>
                      <td>{size}</td>
                      {ranges.map((range) => (
                        <td key={`${range}-${size}`}>
                          {totalOpeningBottles[range] &&
                          totalOpeningBottles[range][size]
                            ? calculateAddt(range, size)
                            : 0}
                        </td>
                      ))}
                      <td>
                        {ranges.reduce((acc, range) => {
                          return calculateAddt(range, size) + acc;
                        }, 0)}
                      </td>
                    </tr>
                  ))}
                <tr>
                  <th>Grand Total</th>
                  {ranges.map((range) => (
                    <td key={`grand-${range}-addt`}>
                      {sizes.reduce((acc, size) => {
                        return calculateAddt(range, size) + acc;
                      }, 0)}
                    </td>
                  ))}
                  <td>
                    {sizes.reduce((acc, size) => {
                      return (
                        ranges.reduce((rangeAcc, range) => {
                          return calculateAddt(range, size) + rangeAcc;
                        }, 0) + acc
                      );
                    }, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sample;
