import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "./HomePage.css"; // Your custom CSS (if any)

function HomePage() {
  const [showSearch, setShowSearch] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const goToUserList = () => {
    navigate("/users");
  };

  const goToStockLookup = () => {
    navigate("/stock/:symbol");
  };

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  const handleInputChange = (e) => {
    setUsername(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      navigate(`/portfolio/${username}`);
      setShowSearch(false); // Optionally hide the search bar after navigating
    }
  };

  return (
    <div className="home-container">
      <h1>Home Page</h1>
      <div className="home-content">
        <p>
          Welcome to the first iteration of my stock viewing application. Click
          on "See user list" to see the current users, or click on "Search for
          user portfolio" to look for a user's portfolio and its value.
        </p>
        <div className="d-flex flex-column align-items-center">
          <Button variant="primary" className="mb-2" onClick={goToUserList}>See user List</Button>
          <Button variant="primary" className="mb-2" onClick={goToStockLookup}>Lookup a stock value</Button>
          <Button variant="primary" onClick={handleSearchClick}>Search for user portfolio</Button>
        </div>
        {showSearch && (
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        )}
      </div>
    </div>
  );
}

export default HomePage;