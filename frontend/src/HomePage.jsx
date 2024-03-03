import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const [showSearch, setShowSearch] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const goToUserList = () => {
    navigate("/users");
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
    <div>
      <h1>Home Page</h1>
      <div>
        <p>
          Welcome to the first iteration of my stock viewing application. Click
          on "See user list" to see the current users, or click on "Search for
          user portfolio" to look for a user's portfolio and its value.
        </p>
      </div>
      <button onClick={goToUserList}>See user List</button>
      <button onClick={handleSearchClick}>Search for user portfolio</button>
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
  );
}

export default HomePage;
