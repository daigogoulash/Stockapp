import React, { useState } from 'react';

const ContactCreate = ({ onCreateUser }) => {
    const [username, setUsername] = useState("");
    const [stocks, setStocks] = useState([]);

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handleStockChange = (index, field, value) => {
        const newStocks = [...stocks];
        newStocks[index] = {
            ...newStocks[index],
            [field]: value
        };
        setStocks(newStocks);
    };

    const handleAddStock = () => {
        setStocks([...stocks, { symbol: '', quantity: 0 }]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Prepare the data in the format expected by the backend
        const newUser = {
            username,
            stocks: stocks.reduce((acc, stock) => {
                acc[stock.symbol] = parseInt(stock.quantity, 10); // Ensure quantity is sent as an integer
                return acc;
            }, {}),
        };
        // Call the onCreateUser prop function with the new user data
        onCreateUser(newUser);
    };

    return (
        <div>
            <h2>Create New User</h2>
            <form onSubmit={handleSubmit}>
                <label>
                    Username:
                    <input type="text" value={username} onChange={handleUsernameChange} />
                </label>
                <div>
                    <h3>Stocks:</h3>
                    {stocks.map((stock, index) => (
                        <div key={index}>
                            <label>
                                Symbol:
                                <input
                                    type="text"
                                    value={stock.symbol}
                                    onChange={(e) => handleStockChange(index, 'symbol', e.target.value)}
                                />
                            </label>
                            <label>
                                Quantity:
                                <input
                                    type="number"
                                    value={stock.quantity}
                                    onChange={(e) => handleStockChange(index, 'quantity', e.target.value)}
                                />
                            </label>
                            <button type="button" onClick={() => handleStockChange(index, 'quantity', '')}>
                                Remove Stock
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={handleAddStock}>Add Stock</button>
                </div>
                <button type="submit">Create User</button>
            </form>
        </div>
    );
};

export default ContactCreate;
