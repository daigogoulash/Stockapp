import { useState, useEffect } from "react";
import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import ContactList from "./Userlist";
import ContactCreate from "./CreateUser";
import HomePage from "./HomePage";
import PortfolioSearch from "./PortfolioSearch";
import StockDataDisplay from "./StockLookup";
import LoginPage from "./Login";
import "bootstrap/dist/css/bootstrap.min.css";




function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const handleLogin = (username, password) => {
    // handle logic to check for user validity
    setIsLoggedIn(true);
  }
  return (
    <Router>
      <Routes>
        {!isLoggedIn && (
        <Route path="/" element={<LoginPage onLogin={handleLogin} />} />)}
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
