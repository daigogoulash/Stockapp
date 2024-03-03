import { useState, useEffect } from "react";
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ContactList from "./Userlist";
import ContactCreate from "./CreateUser";
import HomePage from "./HomePage";
import PortfolioSearch from "./PortfolioSearch";
import StockDataDisplay from "./StockLookup";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/users" element={<ContactList />} />
        <Route path="/create_user" element={<ContactCreate />} />
        <Route path="/portfolio/:username" element={<PortfolioSearch />} />
        <Route path="/stock/:symbol" element={<StockDataDisplay />} />
      </Routes>
    </Router>
  );
}

export default App;
