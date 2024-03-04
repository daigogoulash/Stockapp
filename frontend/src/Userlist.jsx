import React, { useState, useEffect } from "react";

const ContactList = () => {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(
        "https://capstone-ml1.ew.r.appspot.com/users"
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setContacts(data.users); // Assuming the Flask backend sends data in { users: [...] }
      console.log(data.users);
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  return (
    <div>
      <h2>User list</h2>
      <table>
        <thead>
          <tr>
            <th>Username</th>
            <th>Stocks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td className="user-row">{contact.username}</td>
              <td>
                {contact.stocks.map((stock) => (
                  <div key={stock.id} className="stock-entry">
                    {stock.symbol} - Quantity: {stock.quantity}
                  </div>
                ))}
              </td>
              <td>
                <button>Action A, this will be modify portfolio</button>
                <button>Action B, this will be delete user</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContactList;
