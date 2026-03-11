const express = require('express');
const app = express();
const port = 8080;
let mysql = require('mysql2');

// Define a route for GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello World from Express!');
});

// Start the server
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});


let con = mysql.createConnection({
    host: "bucket-deny.with.playit.plus",
    user: "cami_app",
    password: "pass123",
    port:25770
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});