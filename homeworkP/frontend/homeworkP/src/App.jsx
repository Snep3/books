import "./App.css";  

import { FaRegCircleXmark } from "react-icons/fa6";
import React, { useState, useEffect } from "react";

export default function App() {
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [message, setMessage] = useState("");

  //loads books from the JSON 
  const fetchBooks = () => {
    fetch("http://localhost:3000/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Failed to fetch books", err));
  };

  // calls the fetchBooks function, useEffect is used so the page loads 1 time (and not refreshes uncontrollably) 
  useEffect(() => {
    fetchBooks();
  }, []);

  // delete button logic
  const handleDelete = async (id) => {
    try {
      const response = await fetch("http://localhost:3000/delete-book", {
        // using DELETE htttp method 
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      // deletes books by recreating the array without the selected book
      setBooks(prev => prev.filter(book => book.id !== id));
      setMessage("Book deleted");
    } catch (error) {
      console.error("Error deleting book:", error);
      setMessage("Failed to delete book");
    }
  };

  // save button function
  const handleSubmit = async (e) => {
    e.preventDefault();
    // make sure that both input fields are filled
    if (!title || !author) {
      setMessage("Please fill in all fields");
      return;
    }

    //clears the "please fill in all fields" message
    setMessage("");
    const newBook = { title, author };

    // sends the new book to the server
    try {
      const response = await fetch("http://localhost:3000/add-book", {
   // using POST htttp method 

        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBook),
      });

      const result = await response.json();
      setMessage("Book added successfully");

      //clears the input fields and updates the page
      setTitle("");
      setAuthor("");
      fetchBooks();
    } catch (error) {
      setMessage("Error adding book");
      console.error("Error:", error);
    }
  };


  return (
    <div>
      <div className="left-container">
        
      <h1 className="HeaderLeft">Welcome to <span className="SaveMyBook">SaveMyBook</span> Website</h1>

      <div className="Main">
      
      <p className="Instructions">Enter a new book:</p>
      <div className="Inputs">
      <input
        type="text"
        placeholder="book name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
           <input
        type="text"
        placeholder="author name"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      </div>
      <div className="Message">
      {/* shows the relevent message after clicking the button */}
      
      {message && <p>{message}</p>}

      </div>
      <div className="BtnWrap"><button className="SaveBtn" onClick={handleSubmit}>Save Current Book</button></div>

      </div>
      </div>

      <div className="right-container">

{/* creates the list of book, with a delete button next to each book */}
      <h2 className="HeaderRight">Book Library:</h2>
      {/* if there are no books, show a message */}
      <ul className="BookList">
        {books.map((book) => (
          <li className="Book" key={book.id}>
             <div>- {book.title}  <span className="BookAuthor">By {book.author}</span></div>
            <button className="DeleteBtn" onClick={() => handleDelete(book.id)}><FaRegCircleXmark /></button>
          </li>
        ))}
      </ul>

        </div>
      
    </div>
  );
}
