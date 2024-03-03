import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // include the default styling

const StockDataDisplay = () => {
  const [symbol, setSymbol] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    setError("");
    setStockData(null); // Clear previous data
    try {
      // Format the dates as required by your backend, e.g., YYYY-MM-DD
      const formattedStartDate = startDate.toISOString().split("T")[0];
      const formattedEndDate = endDate.toISOString().split("T")[0];

      const response = await axios.get(
        `http://127.0.0.1:5000/stock/${symbol}?start=${formattedStartDate}&end=${formattedEndDate}`
      );
      setStockData(response.data.stock_data);
    } catch (err) {
      setError(
        "Failed to fetch stock data. Please make sure the symbol is correct and dates are valid."
      );
    }
  };

  return (
    <div>
      <h1>Stock Data Lookup</h1>
      <input
        type="text"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
        placeholder="Enter stock symbol"
      />
      <DatePicker
        selected={startDate}
        onChange={(date) => setStartDate(date)}
      />
      <DatePicker selected={endDate} onChange={(date) => setEndDate(date)} />
      <button onClick={handleSearch}>Search</button>

      {error && <p className="error">{error}</p>}

      {stockData && (
        <div>
          <h2>Historical Stock Data for {symbol}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stockData).map(([date, value]) => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>${value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockDataDisplay;
