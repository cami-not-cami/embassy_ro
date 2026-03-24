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
const port = 8080;
const secret = env.parsed.SECRETKEY;
let i18n;

app.use(express.json());
app.use(express.urlencoded({extended: true}));


// MySQL connection
const con = mysql.createPool({
    host: env.parsed.HOST,
    user: env.parsed.USER,
    password: env.parsed.PASSWORD,
    port: env.parsed.PORT,
    waitForConnections: true,
    database: env.parsed.DBNAME,
    connectionLimit: 10,
    connectTimeout: 5000,
});


async function startServer() {
    const {I18n} = await import("i18n-js");

    //translations
    i18n = new I18n({
        ro: {
            home: "Acasă",
            search: "Căutare",
            romania: "România",
            contact: "Contactaţi-ne",
            FirstName: "Prenume",
            LastName: "Nume",
            überblick: "Viziune",
            email: "Adresa de email",
            password: "Parolă",
            information: "Informații",
            pictures: "Poze",
            aboutus: "Despre noi",
            Botschafter: "Ambasade",
            Botschaftsteam: "Echipa ambasadei",
            actual: "Actual",
            haager: "\"Apostilare\"",
            visa: " Servicii consulare.Vize",
            konsular: "Taxe consulare",
            datenschutz: "Protecția datelor",
            konsularform: "Formulare consulat",
            wirtschaft: "Birou economic",
            förderung: "Promovarea cooperării economice",
            investieren: "Companiile austriece investesc în România ",
            ausstellungen: "Expoziții",
            bilaterale: "Relații bilaterale",
            politischebeziehungen: "Relații politice",
            wirtschaftlichezusammenarbeit: "Cooperarea economică",
            kulturelle: "Relații culturale și științifice",
            institut: "Prezența instituțională",
            honorarkonsulate: "Consulate Onorifice",
            kulturinstitut: "Institutul Cultural Român din Viena",
            vertretungen: "Reprezentare",
            logout: "Deconectați-vă",
            signup: "Conectați-vă",
            inputerror: "Intrare invalidă",
            passwordmatcherror: "Parolele nu se potrivesc",
            menu: "Meniu",
            login: "Autentificare",
            edit: "Editați contul",
            clicksignup: "Nu aveți un cont? Apasă aici pentru a crea unul nou!",
            passwort: "Parolă",
            confirmpassword: "Confirmare parolă",
            post: "Postări",
            adminpage: "Pagina administratorului",
            editpost: "Creează o postare",
            title: "Titlu",
            content: "Conținut",
            promotionquestion: "Doriți să schimbați rolul utilizatorului în angajat?",
            demotequestion: "Doriți să schimbați rolul angajatului în utilizator?",
            areyousureyouwanttodeleteuser: "Doriți să ștergeți  utilizatorul??",
            telephone: "Număr de telefon",
            description: "Descriere",
            userroles: "Rol utilizator",
            comlikesdis: "Comentarii Aprecieri și Deprecieri",
            postlikesdis: "Postări Aprecieri și Deprecieri",

        },
        de: {
            home: "Startseite",
            search: "Suche",
            romania: "Romenien",
            contact: "Kontakt",
            FirstName: "Vorname",
            firstname: "Vorname",
            lastname: "Nachname",
            LastName: "Nachname",
            uberblick: "Überblick",
            email: "Email",
            password: "Passwort",
            information: "Information",
            pictures: "Bilder",
            aboutus: "Über uns",
            Botschafter: "Botschafter",
            Botschaftsteam: "Botschaftsteam",
            actual: "Actual",
            visa: "Visa-und Konsularabteilung",
            konsular: "Konsulargebühren",
            haager: "\"Haager Apostille\"",
            datenschutz: "Datenschutz",
            konsularform: "Konsularische Formularen",
            wirtschaft: "Wirtschafts-Bureau",
            förderung: "Förderung der wirtschaftlichen Zusammenarbeit",
            investieren: "Österreichische Unternehmen in Rumänien investieren",
            ausstellungen: "Ausstellungen",
            bilaterale: "Bilaterale Beziehungen",
            politischebeziehungen: "Politische Beziehungen",
            wirtschaftlichezusammenarbeit: "Wirtschaftliche Zusammenarbeit",
            kulturelle: "Kulturelle und wissenschaftliche Beziehungen",
            institut: "Institutionelle Präsenz",
            honorarkonsulate: "Honorarkonsulate",
            kulturinstitut: "Honorarkonsulate",
            vertretungen: "Vertretungen",
            logout: "Abmelden",
            signup: "Anmelden",
            inputerror: "Ungültige Eingabe",
            passwordmatcherror: "Die Passwörter stimmen nicht überein",
            menu: "Menü",
            login: "Anmelden",
            edit: "Nutzer editieren",
            clicksignup: "Noch keinen Account? Klicke hier um einen neuen Acccount zu erstellen!",
            passwort: "Passwort",
            confirmpassword: "Passwort bestätigen",
            post: "Posten",
            adminpage: "Adminseite",
            editpost: "Post erstellen",
            title: "Titel",
            content: "Inhalt",
            promotionquestion: "Wollen Sie diesen Benutzer wirklich in einen Mitarbeiter umwandeln?",
            demotequestion: "Wollen Sie diesen Mitarbeiter wirklich in einem Benutzer umwandeln?",
            areyousureyouwanttodeleteuser: "Wollen Sie diesen Benutzer wirklich löschen?",
            telephone: "Telefonnummer",
            description: "Beschreibung",
            userroles: "Benutzerrollen",
            comlikesdis: "Kommentare Likes und Dislikes",
            postlikesdis: "Posts Likes und Dislikes",


        }
    });

    // Serve static files from the server directly to client
    app.use('/js', express.static(path.join(__dirname, 'client/js')));
    app.use('/images', express.static(path.join(__dirname, 'client/images')));
    app.use('/css', express.static(path.join(__dirname, 'client/css')));
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


    //serve html files with routing since they are dynamic
    app.get('/html', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/html/index.html'));
    });
    app.get("/", (req, res) => {
        const locale = req.query.lang || "de";
        i18n.locale = locale;

        let html = fs.readFileSync(path.join(__dirname, 'client/html/index.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));

        res.send(html);
    });
    app.get("/createpost.html", (req, res) => {
        let html = fs.readFileSync(path.join(__dirname, 'client/html/createpost.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });
    app.get("/adminpage.html", (req, res) => {
        let html = fs.readFileSync(path.join(__dirname, 'client/html/adminpage.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });
    app.get("/contact", (req, res) => {
        const locale = req.query.lang || "de";
        i18n.locale = locale;

        let html = fs.readFileSync(path.join(__dirname, 'client/html/contact.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });
    app.get("/romania", (req, res) => {
        const locale = req.query.lang || "de";
        i18n.locale = locale;

        let html = fs.readFileSync(path.join(__dirname, 'client/html/staticpage.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });
    app.get("/html/createpost.html", (req, res) => {
        let html = fs.readFileSync(path.join(__dirname, 'client/html/createpost.html'), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));
        res.send(html);
    });


    //use multer instance to define metadata
    const storagePosts = multer.diskStorage({
        destination: './uploads/posts',
        filename: function (req, file, cb) {
            const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
            cb(null, nameWithoutExt + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    const storageUserPFP = multer.diskStorage({
        destination: './uploads/pfps',
        filename: function (req, file, cb) {
            const nameWithoutExt = path.basename(file.originalname, path.extname(file.originalname));
            cb(null, nameWithoutExt + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    const uploadPost = multer({
        storage: storagePosts,
        limits: {fileSize: 1000000},
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).single('myFile');
    // Multer upload handler for profile pictures, just one file
    const uploadPFP = multer({
        storage: storageUserPFP,
        limits: {fileSize: 1000000},
        fileFilter: function (req, file, cb) {
            checkFileType(file, cb);
        }
    }).single('myFile');

    //file validation
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

    //endpoint for uploading pfps and post pictures
    app.post('/api/upload/post', (req, res) => {
        uploadPost(req, res, (err) => {
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
    app.post('/api/upload/pfp', (req, res) => {
        uploadPFP(req, res, (err) => {
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


    //function to decode the token
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

    //LIKE DISLIKE ENDPOINTS
    app.get("/api/myVote/post/:postId", verifyToken, (req, res) => {
        const {postId} = req.params;

        con.query(
            `SELECT *
             FROM likedislike
             WHERE LikDisUserIdFK = ?
               AND LikDisPostComId = ?
               AND LikDisIsPost = 1`,

            [userId, postId],
            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                if (results.length === 0) return res.json({reaction: null});
                res.json({reaction: results[0].LikDisIsLike == 1 ? "liked" : "disliked"});
            }
        );
    });
    app.post('/api/likeDislike', (req, res) => {
        const {LikDisUserIdFK, postComID, isPost, isLike} = req.body;
        console.log("likeDislike body:", req.body); // ← ADD THIS
        con.query(
            'INSERT INTO likedislike (LikDisUserIdFK, LikDisPostComId, LikDisIsPost, LikDisIsLike) VALUES (?, ?, ?, ?)',
            [LikDisUserIdFK, postComID, isPost, isLike],
            (err, result) => {
                if (err) {
                    console.error("DB ERROR:", err.code, err.sqlMessage); // ← ADD THIS
                    return res.status(500).json({error: err.message});
                }
                res.json({success: true, id: result.insertId});
            }
        )
    })
    app.put("/api/likedislike/:id", verifyToken, (req, res) => {
        const {isLike, postComID, isPost} = req.body;
        const userIdPK = req.params.id;
        if (req.user.userId == userIdPK) {
            con.query(
                'UPDATE likedislike SET LikDisIsLike=?  WHERE LikDisPostComId=? AND LikDisIsPost=? AND LikDisUserIdFK=?',
                [isLike, postComID, isPost, userIdPK],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.affectedRows});
                    if (result.affectedRows === 0) {
                        return res.status(404).json({error: "Like/dislike not found"});
                    }
                }
            )
        } else {
            res.send("Error in likeddislike id put")
        }
    })
    app.delete("/api/likedislike/:id", verifyToken, (req, res) => {
        const userIdPK = req.params.id;
        if (req.user.userId == userIdPK) {

            const {postComId, isPost} = req.body;
            con.query(
                'DELETE FROM likedislike WHERE LikDisUserIdFK = ? AND LikDisPostComId=? AND LikDisIsPost=?',
                [userIdPK, postComId, isPost],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, user: result.affectedRows});
                }
            )
        }
    })


    //COMMENT ENDPOINTS
    app.get("/api/myVote/comment/:commentId", verifyToken, (req, res) => {
        const {commentId} = req.params;
        const userId = req.user.userId;

        if (!userId) return res.status(400).json({error: "userId query param required"});

        con.query(
            `SELECT *
             FROM likedislike
             WHERE LikDisUserIdFK = ?
               AND LikDisPostComId = ?
               AND LikDisIsPost = 0`,
            [userId, commentId],
            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                if (results.length === 0) return res.json({reaction: null});
                res.json({reaction: results[0].LikDisIsLike == 1 ? "liked" : "disliked"});

            }
        );
    });
    app.get("/api/commentLike", (req, res) => {
        con.query(
            `SELECT c.ComIdPK,
                    c.ComContent,
                    COUNT(CASE WHEN ld.LikDisIsLike = 1 THEN 1 END) AS likes,
                    COUNT(CASE WHEN ld.LikDisIsLike = 0 THEN 1 END) AS dislikes
             FROM comment c
                      LEFT JOIN likedislike ld
                                ON ld.LikDisPostComId = c.ComIdPK AND ld.LikDisIsPost = 0
             GROUP BY c.ComIdPK, c.ComContent`,
            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            });
    })
    app.get("/api/comment/:postId", (req, res) => {
        con.query(
            `SELECT c.*, u.UserFirstname AS ComUserFirstname, u.UserLastname AS ComUserLastname
             FROM comment c
                      LEFT JOIN user u ON c.ComUserIdFK = u.UserIdPK
             WHERE c.ComPostIdFK = ?`,
            [req.params.postId],
            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            }
        );
    });
    app.post("/api/comment", (req, res) => {
        const {ComUserIdFK, ComPostIdFK, ComComIdFK, ComContent} = req.body;
        con.query(
            `INSERT INTO comment (ComUserIdFK, ComPostIdFK, ComComIdFK, ComContent)
             VALUES (?, ?, ?, ?)`,
            [ComUserIdFK, ComPostIdFK, ComComIdFK, ComContent],
            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json({message: "Comment created", id: results.insertId});
            }
        );
    });
    app.delete("/api/comment/:id", verifyToken, (req, res) => {
        const comID = req.body;
        const userIDPK = req.params.id;
        if (req.user.userId == userIDPK) {
            con.query(
                'DELETE FROM comment WHERE ComIdPK=?',
                [comID],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, user: result.affectedRows});
                }
            )
        }
    })

    //USER ENDPOINTS
    app.get("/users", (req, res) => {
        con.query(
            `SELECT u.UserIdPK,
                    u.UserFirstname,
                    u.UserLastname,
                    u.UserEmail,
                    u.UserPassword,
                    e.EmpIdPK,
                    e.EmpPhonenumber,
                    e.EmpDescription,
                    e.EmpIsAdmin
             FROM user u
                      LEFT JOIN employee e ON u.UserEmpFK = e.EmpIdPK`, (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            });
    });
    app.get('/api/userInfo', verifyToken, async (req, res) => {
        const userIDPK = req.user.userId;
        const userRole = req.user.role;
        const isAdmin = req.user.isAdmin;
        return res.json({userIDPK, userRole, isAdmin});
    })
    app.get("/user/:id", verifyToken, (req, res) => {
        const userIDPK = req.params.id;
        con.query(
            `SELECT u.UserIdPK,
                    u.UserFirstname,
                    u.UserLastname,
                    u.UserEmail,
                    e.EmpIdPK,
                    e.EmpPhonenumber,
                    e.EmpDescription,
                    e.EmpIsAdmin
             FROM user u
                      LEFT JOIN employee e ON u.UserEmpFK = e.EmpIdPK
             WHERE u.UserIdPK = ?`,
            [userIDPK],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                if (result.length === 0) return res.status(404).json({error: "User not found"});
                res.json({success: true, user: result[0]});
            }
        );
    });
    //login endpoint signs the bearer token
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
    //sign up
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
    app.put("/editUser/:id", verifyToken, (req, res) => {
        const {firstname, lastname, email, employeeFK} = req.body;
        const userIDPK = req.params.id;
        if (req.user.isAdmin == 1 || req.user.userId == userIDPK) {
            console.log(req.user.userId + "TRUE");
            con.query(
                'UPDATE user SET UserFirstname=?, UserLastname=?, UserEmail=? ,UserEmpFK=?  WHERE UserIdPK=?',
                [firstname, lastname, email, employeeFK, userIDPK],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.insertId});
                }
            )
        } else {
            console.log("Trying for admin failed" +
                "Admin is not 1  " + req.user.isAdmin);
        }
    })
    app.delete("/user/:id", verifyToken, (req, res) => {
        const userIDPK = req.params.id;
        if (req.user.isAdmin === 1) {
            con.query(
                'DELETE employee FROM employee INNER JOIN user On user.UserEmpFK = employee.EmpIdPK Where user.UserIdPK = ?',
                [userIDPK],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, user: result.affectedRows});
                }
            )
        }
    })

    //EMPLOYEE ENDPOINTS
    app.get("/employee/:id", verifyToken, (req, res) => {
        const userIDPK = req.params.id;
        con.query(
            `SELECT u.UserIdPK,
                    u.UserFirstname,
                    u.UserLastname,
                    u.UserEmail,
                    e.EmpIdPK,
                    e.EmpPhonenumber,
                    e.EmpDescription,
                    e.EmpIsAdmin
             FROM user u
                      LEFT JOIN employee e ON u.UserEmpFK = e.EmpIdPK
             WHERE u.UserIdPK = ?`,
            [userIDPK],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                if (result.length === 0) return res.status(404).json({error: "User not found"});
                res.json({success: true, user: result[0]});
            }
        );
    });
    app.post("/createEmployee", verifyToken, async (req, res) => {
        const {empPhoneNumber, EmpIsAdmin, EmpDescription} = req.body;

        if (req.user.isAdmin === 1) {
            con.query(
                'INSERT INTO employee ( EmpPhonenumber,EmpIsAdmin,EmpDescription) VALUES (?, ?, ?)',
                [empPhoneNumber, EmpIsAdmin, EmpDescription],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.insertId});
                }
            )
        }
    })
    app.put("/editEmployee", verifyToken, async (req, res) => {
        const {EmpIdPK, empPhoneNumber, EmpIsAdmin, EmpDescription} = req.body;
        if (req.user.isAdmin === 1) {
            con.query(
                'UPDATE employee SET EmpPhonenumber=?, EmpIsAdmin=?, EmpDescription=? WHERE EmpIdPK=?',
                [empPhoneNumber, EmpIsAdmin, EmpDescription, EmpIdPK],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.insertId});
                }
            )
        }
    })
    app.delete("/employee/:id", verifyToken, (req, res) => {
        const employeeIDPK = req.params.id;
        if (req.user.isAdmin === 1) {
            con.query(
                'DELETE FROM employee  Where EmpIdPK= ?',
                [employeeIDPK],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, user: result.affectedRows});
                }
            )
        }
    })


    //POST ENDPOINTS
    app.get('/posts', (req, res) => {
        con.query(
            `SELECT *
             From post p
                      LEFT JOIN employee e ON p.PostEmpIdFK = e.EmpIdPK
                      LEFT JOIN user u ON u.UserIdPK = e.EmpIdPK`, (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            });
    })
    app.get('/api/last3posts', (req, res) => {
        con.query(
            `SELECT DISTINCT *
             FROM post p
                      LEFT JOIN employee e ON p.PostEmpIdFK = e.EmpIdPK
                      LEFT JOIN user u ON u.UserIdPK = e.EmpIdPK
             ORDER BY p.PostCreatedAt DESC LIMIT 3`, (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            });
    })
    app.get("/api/postLike", (req, res) => {
        con.query(
            `SELECT p.PostIdPK,
                    p.PostTitle,
                    COUNT(CASE WHEN ld.LikDisIsLike = 1 THEN 1 END) AS likes,
                    COUNT(CASE WHEN ld.LikDisIsLike = 0 THEN 1 END) AS dislikes
             FROM post p
                      LEFT JOIN likedislike ld
                                ON ld.LikDisPostComId = p.PostIdPK AND ld.LikDisIsPost = 1
             GROUP BY p.PostIdPK, p.PostTitle`,
            (err, results) => {
                if (err) return res.status(500).json({error: err.message});
                res.json(results);
            }
        );
    });
    app.get("/post/:id", verifyToken, (req, res) => {
        const postID = req.params.id;
        con.query(`SELECT *
                   From post p
                            LEFT JOIN employee e ON p.PostEmpIdFK = e.EmpIdPK
                            LEFT JOIN user u ON u.UserIdPK = e.EmpIdPK
                   WHERE p.PostIdPK = ?`,
            [postID],
            (err, result) => {
                if (err) return res.status(500).json({error: err.message});
                if (result.length === 0) return res.status(404).json({error: "User not found"});
                res.json({success: true, user: result[0]});
            }
        );
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
    app.put("/editPost/:id", verifyToken, (req, res) => {
        const {postEmpFK, title, content, updatedAt, imagePath} = req.body;
        const postID = req.params.id;
        if (req.user.isAdmin === 1 || req.user.userId == postEmpFK)
            con.query(
                'UPDATE post SET PostTitle=?, PostContent=?, PostUpdatedAt=?, PostImagePath=? WHERE PostIdPK=?',
                [title, content, updatedAt, imagePath, postID],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, id: result.insertId});
                }
            )
    })
    app.delete("/post/:id", verifyToken, (req, res) => {
        const postID = req.params.id;
        const {postEmpFK} = req.body;
        if (req.user.isAdmin === 1 || req.user.userId == postEmpFK) {
            con.query(
                'DELETE FROM post WHERE PostIdPK=?',
                [postID],
                (err, result) => {
                    if (err) return res.status(500).json({error: err.message});
                    res.json({success: true, result: result.affectedRows});
                }
            )
        }
    })


    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });

}


//Hashing password with SHA3-512
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