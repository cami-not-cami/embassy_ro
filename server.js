const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const url = require("url");

const app = express();
const port = 8080;
let env = require("dotenv").config();
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

    app.use(express.urlencoded({ extended: true }));

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

    app.get("/dbq", (req, res) => {
        con.query('SELECT * FROM user;', (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results);
        });
    });

    app.post("/db", (req, res) => {
        res.json({ success: true });
    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
}




startServer();