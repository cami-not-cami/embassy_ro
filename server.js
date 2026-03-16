const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const url = require("url");
const crypto = require("crypto");
let env = require("dotenv").config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const port = 8080;
let i18n;
// MySQL
const con = mysql.createPool({
    host: env.parsed.HOST,
    user:env.parsed.USER,
    password: env.parsed.PASSWORD,
    port: env.parsed.PORT,
    waitForConnections: true,
    database: env.parsed.DBNAME,
    connectionLimit: 10,
});
async function startServer() {
    const { I18n } = await import("i18n-js");

    i18n = new I18n({
        ro: { home: "Acasă", search: "Căutare", romania:"România", contact:"Contactaţi-ne" },
        de: { home: "Startseite", search: "Suche", romania: "Romenien", contact:"Kontakt", FirstName:"Vorname", LastName:"Nachname" }
    });


    // Serve only JS/CSS as static, NOT the html folder
    app.use('/js', express.static(path.join(__dirname, 'client/js')));
    app.use('/images', express.static(path.join(__dirname, 'client/images')));
    app.use('/css', express.static(path.join(__dirname, 'client/css')));

    app.get("/", (req, res) => {
        const locale = req.query.lang || "de";
        i18n.locale = locale;

        let html = fs.readFileSync(path.join(__dirname, 'client/html/index.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));

        res.send(html);
    });

    app.get("/users", (req, res) => {
        con.query('SELECT * FROM user;', (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });
    app.put("/user", (req, res) => {

    })
    app.delete("/user/:id", (req, res) => {

    })
    app.get("/user/:id", (req, res) => {

    })
    app.post("/users", async (req, res) => {
        const { firstname, lastname, email, password,  } = req.body;
        const hashed = HashPassword(password);

        con.query(
            'INSERT INTO user (UserFirstname, UserLastname, UserEmail, UserPassword) VALUES ( ?, ?, ?, ?)',
            [firstname, lastname, email, hashed],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ id: result.insertId });
            }
        );
    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
}
function HashPassword(password) {
// Create a hash object
    const hash = crypto.createHash('sha3-512');

// Update the hash with data
    hash.update(password);

// Get the digest in hex format
    const digest = hash.digest('hex');

    console.log('Data:', password);
    console.log('SHA-512 Hash:', digest);
    return digest;
}

startServer();
