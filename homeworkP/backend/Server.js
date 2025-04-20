const http = require("http");
const fs = require("fs");
const path = require("path");

const booksPath = path.join(__dirname, "books.JSON");
const PORT = 3000;

const server = http.createServer((req, res) => {
  // allow frontend to talk to backend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // allows access for POST and DELETE requests from different ports(3000, 5137, etc)
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET all books
  if (req.method === "GET" && req.url === "/books") {
    fs.readFile(booksPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end("Failed to read books file");
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(data);
    });
    return;
  }

  // POST new book
  if (req.method === "POST" && req.url === "/add-book") {
    let body = "";
    //adds information to rest of data
    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const newBook = JSON.parse(body);
        //creates a unique ID 
        const uniqueId = Date.now();
        newBook.id = uniqueId;

        fs.readFile(booksPath, (err, data) => {
          let books = [];
          if (!err) {
            books = JSON.parse(data);
          }
          // adds the new book to the end of the array
          books.push(newBook);
          //saves the updated list of books
          fs.writeFile(booksPath, JSON.stringify(books, null, 2), err => {
            if (err) {
              res.writeHead(500);
              res.end("Failed to save book");
              return;
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, book: newBook }));
          });
        });
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });

    return;
  }

  //DELETE book
  if (req.method === "DELETE" && req.url === "/delete-book") {
    let body = "";
  
    req.on("data", chunk => {
      body += chunk.toString();
    });
  
    req.on("end", () => {
      try {
        const { id } = JSON.parse(body);
  // go through the books array to find the book with the selected id
        fs.readFile(booksPath, "utf-8", (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end("Failed to read books");
            return;
          }
         //deletes books by recreating the array without the selected book
          const currentBooks = JSON.parse(data);
          const updatedBooks = currentBooks.filter(book => book.id !== id);
          
          //saves the updated list of books
          fs.writeFile(booksPath, JSON.stringify(updatedBooks, null, 2), err => {
            if (err) {
              res.writeHead(500);
              res.end("Failed to save updated books");
              return;
            }
  
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Book deleted by ID" }));
          });
        });
      } catch (error) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  
    return;
  }
  

  // default frontend route 
  if (req.url === "/") {
    const reactPath = path.join(__dirname, "../frontend/index.html");

    fs.readFile(reactPath, function (error, data) {
      if (error) {
        res.writeHead(404);
        res.write("Frontend not found");
        res.end();
      } else {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(data);
        res.end();
      }
    });
    return;
  }

  // Not found
  res.writeHead(404);
  res.end("Route not found");
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
