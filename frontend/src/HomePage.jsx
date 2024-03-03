import React from "react";

function HomePage() {
  const homeFunction = () => {
    console.log("This is the Home Page");
  };

  return (
    <div>
      <h1>Home Page</h1>
      <button onClick={homeFunction}>Click me</button>
    </div>
  );
}

export default HomePage;
