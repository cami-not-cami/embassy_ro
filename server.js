const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const url = require("url");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {verify} = require("jsonwebtoken");
let env = require("dotenv").config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));


const port = 8080;
let i18n;
// MySQL
const con = mysql.createPool({
    host: env.parsed.HOST,
    user: env.parsed.USER,
    password: env.parsed.PASSWORD,
    port: env.parsed.PORT,
    waitForConnections: true,
    database: env.parsed.DBNAME,
    connectionLimit: 10,
});
const secret = env.parsed.SECRETKEY;

async function startServer() {
    const {I18n} = await import("i18n-js");

    i18n = new I18n({
        ro: {
            home: "Acasă",
            search: "Căutare",
            romania: "România",
            contact: "Contactaţi-ne",
            FirstName: "Prenume",
            LastName: "Nume"
        },
        de: {
            home: "Startseite",
            search: "Suche",
            romania: "Romenien",
            contact: "Kontakt",
            FirstName: "Vorname",
            LastName: "Nachname"
        }
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
            if (err) return res.status(500).json({error: err.message});
            res.json(results);
        });
    });

    app.get("/html/createpost.html", (req, res) => {
        let html = fs.readFileSync(path.join(__dirname, 'client/html/createpost.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });
    app.get("/adminpage.html", (req, res) => {
        let html = fs.readFileSync(path.join(__dirname, 'client/html/adminpage.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });


    //only the admin gets to use this, gives the user his role
    app.put("/user", (req, res) => {
        con.query()

    })
    //token
    app.delete("/user/:id", (req, res) => {

    })
    //login no t
    app.post("/user/login", async (req, res) => {
        const {email, password,} = req.body;
        const hashedPassword = HashPassword(password);
        console.log("Hashed pass " + hashedPassword);
        console.log("Email " + email);
        console.log(password);

        con.query('Select UserPassword From user WHERE UserEmail=?;', [email], (err, results) => {
            if (err) return res.status(500).json({error: err.message});
            if (results.length === 0) {
                return res.status(401).json({error: "User not found"});
            }
            if (hashedPassword === results[0].UserPassword) {
                //if we log in then we make the token for the user, SEND IT TO THE FRONT
                const token = jwt.sign({ username: results[0].UserEmail, role: results[0].UserEmpFK }, secret, { expiresIn: '1h' });
                return res.json({success: true, message: "Login successful", token: token});

            } else {
                return res.status(401).json({error: "Passwords do not match"});
            }
        })
    })
    //sign up no t
    app.post("/users", async (req, res) => {
        const {firstname, lastname, email, password,} = req.body;
        const hashed = HashPassword(password);

        con.query(
            'INSERT INTO user (UserFirstname, UserLastname, UserEmail, UserPassword) VALUES ( ?, ?, ?, ?)',
            [firstname, lastname, email, hashed],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({id: result.insertId});
            }
        );
    });
    //also needs token check
    app.post("/createPost", async (req, res) => {
        const {employeeFK,title , content, createdAt,updatedAt,imagePath,} = req.body;

        con.query(
            'INSERT INTO post (PostEmpIdFK, PostTitle, PostContent, PostCreatedAt,PostUpdatedAt,PostImagePath) VALUES ( ?, ?, ?, ?, ?, ?)',
            [employeeFK, title, content, createdAt, updatedAt, imagePath],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({id: result.insertId});
            }
        );
    });
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });

    const verifyToken = (req, res, next) => {
        // Get token from header: "Bearer eyJhbGciOi..."
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({success: false, message: "No token"});
        }

        try {
            // Decrypt and verify with same secret
            const decoded = jwt.verify(token, secret);
            // decoded now contains: { username: 'user@email.com', iat: 1234, exp: 5678 }
            req.user = decoded;  // Store it on request for later use
            next();
        } catch (err) {
            res.status(403).json({success: false, message: "Invalid token"});
        }
    };
}

function HashPassword(password) {
    if (password === "") {
        throw new Error("Password cannot be empty");
    }
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
