const express = require('express');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');

const app = express();
const port = 8080;

let i18n;
async function startServer() {
    const { I18n } = await import("i18n-js");

    i18n = new I18n({
        en: { home: "Home", search: "Search" },
        ro: { home: "Acasă", search: "Căutare" },
        de: { home: "Startseite", search: "Suche" }
    });

    app.use(express.static(path.join(__dirname, "client")));

    app.get("/", (req, res) => {
        const locale = req.query.lang || "en";
        i18n.locale = locale;

        let html = fs.readFileSync(path.join(__dirname, "client/index.html"), "utf-8");
        html = html.replace(/{{(\w+)}}/g, (_, key) => i18n.t(key));

        res.send(html);
    });

    app.listen(port, () => {
        console.log(`App listening at http://localhost:${port}`);
    });
}

// MySQL
const con = mysql.createConnection({
    host: "bucket-deny.with.playit.plus",
    user: "cami_app",
    password: "pass123",
    port: 25770
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

startServer();