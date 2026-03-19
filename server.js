const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const url = require("url");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {verify} = require("jsonwebtoken");
let env = require("dotenv").config();
const multer = require('multer');

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
            LastName: "Nachname",
            überblick: "Überblick",

        }
    });

    // Serve only JS/CSS as static, NOT the html folder
    app.use('/js', express.static(path.join(__dirname, 'client/js')));
    app.use('/images', express.static(path.join(__dirname, 'client/images')));

    app.use('/css', express.static(path.join(__dirname, 'client/css')));
    app.use('/uploads',express.static(path.join(__dirname,'uploads')));
    app.get('/html', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/html/index.html'));
    });
    const storage = multer.diskStorage({
        destination: './uploads/posts',
        filename: function (req, file, cb) {
            cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    // Add file type validation
    const upload = multer({
        storage: storage,
        limits: {fileSize: 1000000},
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).single('myFile');
    const verifyToken = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({success: false, message: "No token"});
        }
        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            console.log(req.user);
            next();
        } catch (err) {
            return res.status(403).json({success: false, message: "Invalid token"});
        }
    };
    function checkFileType(file, cb) {

        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images only! (jpeg, jpg, png)');
        }
    }

    app.post('/upload', (req, res) => {
        upload(req, res, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({error: err});
            }
            if (!req.file) {
                return res.status(400).json({error: 'Please send file'});
            }

            try {
                const filePath = req.file.path;

                res.json({
                    success: true,
                    message: 'File uploaded!',
                    filePath: filePath
                });
                console.log(filePath);
            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({error: 'Upload failed'});
            }
        });
    });
    app.get('/posts', (req, res) => {
        con.query(
            `SELECT * FROM post p LEFT JOIN employee e ON p.PostEmpIdFK = e.EmpIdPK`, (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            });
    })
    app.get("/", (req, res) => {
        const locale = req.query.lang || "de";
        i18n.locale = locale;

        let html = fs.readFileSync(path.join(__dirname, 'client/html/index.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));

        res.send(html);
    });

    app.get("/users", (req, res) => {
        con.query(
            `SELECT u.UserIdPK, u.UserFirstname, u.UserLastname, u.UserEmail, u.UserPassword, e.EmpIdPK, e.EmpPhonenumber, e.EmpDescription, e.EmpIsAdmin
             FROM user u
                      LEFT JOIN employee e ON u.UserEmpFK = e.EmpIdPK`, (err, results) => {
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
    app.put("/editUser", verifyToken,(req, res) => {
        const { userIDPK, firstname, lastname, email } = req.body;

        if(req.user.isAdmin === 1)
        {
        con.query(
            'UPDATE user SET UserFirstname=?, UserLastname=?, UserEmail=? WHERE UserIdPK=?',
            [firstname, lastname, email,userIDPK],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({success: true, id: result.insertId});
            }
        )}
        else {
            console.log("Trying for admin failed" +
                "Admin is not 1  " + req.user.isAdmin);
        }
    })

    //token
    app.delete("/user/id", (req, res) => {
        if(req.user.isAdmin == 1){
            con.query(
                'DELETE FROM user  WHERE UserIdPK=?',
                [userIDPK],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.insertId});
                }
            )
        }
    })
    //login no t
    app.post("/user/login", async (req, res) => {
        const {email, password} = req.body;
        const hashedPassword = HashPassword(password);

        con.query(
            `SELECT u.UserIdPK, u.UserEmail, u.UserPassword, e.EmpIdPK, e.EmpIsAdmin
             FROM user u
                      LEFT JOIN employee e ON u.UserEmpFK = e.EmpIdPK
             WHERE u.UserEmail = ?`,
            [email],

            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                if (results.length === 0) {
                    return res.status(401).json({error: "User not found"});
                }
                if (hashedPassword === results[0].UserPassword) {

                    const token = jwt.sign({
                        userId: results[0].UserIdPK,
                        username: results[0].UserEmail,
                        role: results[0].EmpIdPK,
                        isAdmin: results[0].EmpIsAdmin
                    }, secret, {expiresIn: '1h'});

                    return res.json({success: true, message: "Login successful", token: token});
                } else {
                    return res.status(401).json({error: "Passwords do not match"});
                }
            }
        );
    });
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
    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });


    app.post("/createPost", verifyToken, async (req, res) => {
        const {title, content, createdAt, updatedAt, imagePath} = req.body;
        const userRole = req.user.role;

        if (userRole == null) {
            return res.status(403).json({error: "Only employees can create posts"});
        } else {
            console.log("Running query")
            con.query(
                'INSERT INTO post ( PostTitle,PostEmpIdFK, PostContent,PostCreatedAt,PostUpdatedAt, PostImagePath) VALUES (?, ?,?, ?, ?, ?)',
                [title, userRole, content, createdAt, updatedAt, imagePath],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.insertId});
                }
            );
        }
    });

    app.post("/createEmployee", verifyToken, async (req, res) => {
        con.query(
            'INSERT INTO employee ( EmpPhonenumber,EmpIsAdmin,EmpDescription) VALUES (?, ?, ?)',
            [empPhoneNumber, EmpIsAdmin, EmpDescription],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({success: true, id: result.insertId});
            }
        )
    })
    //you need to send the id in the body
    app.put("/editEmployee", verifyToken, async (req, res) => {
        const { EmpIdPK, empPhoneNumber, EmpIsAdmin, EmpDescription } = req.body;
        con.query(
            'UPDATE employee SET EmpPhonenumber=?, EmpIsAdmin=?, EmpDescription=? WHERE EmpIdPK=?',
            [empPhoneNumber, EmpIsAdmin, EmpDescription, EmpIdPK],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({success: true, id: result.insertId});
            }
        )
    })
    app.get("/html/createpost.html", (req, res) => {
        let html = fs.readFileSync(path.join(__dirname, 'client/html/createpost.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });
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

startServer().then();