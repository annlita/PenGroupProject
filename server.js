const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

function loadUsers() {
    const filePath = path.join(__dirname, "users.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}

const users = loadUsers();

// Correct log file path
const logFile = path.join(__dirname, "login_logs.txt");

// Ensure file exists
if (!fs.existsSync(logFile)) {
    fs.writeFileSync(logFile, "");
}

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const validUser = users.find(
        (u) => u.username === username && u.password === password
    );

    if (validUser) {
        // ⭐ CHECK IF ADMIN
        if (username === "admin" && password === "1234") {
            return res.redirect("/admin.html");
        }
        // ⭐ NORMAL USER
        return res.redirect("/success.html");
    }

    // Log failed login attempt
    const entry = `FAILED LOGIN | User: ${username} | Time: ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, entry);

    // Invalid login → show error
    const loginPage = fs.readFileSync("./public/index.html", "utf8");
    const errorInjected = loginPage.replace(
        '<div class="login-box">',
        `<div class="login-box">
            <p class="error">❌ Incorrect username or password</p>`
    );

    res.send(errorInjected);
});

// Route for logs.html
app.get("/logs", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "logs.html"));
});

// Return the contents of login_logs.txt
app.get("/get-logs", (req, res) => {
    const logs = fs.readFileSync(logFile, "utf8");
    res.send(logs || "No logs yet.");
});

// ⭐ FIXED — Clear logs (correct file)
app.get("/clear-logs", (req, res) => {

    fs.writeFileSync(logFile, ""); // CLEAR THE CORRECT FILE

    res.send(`
        <body style="font-family:Arial; background:pink; text-align:center; padding-top:80px;">
            <h1 style="color:#d0006f;">Logs Cleared ✔</h1>
            <a href="/logs" style="padding:10px 20px; background:hotpink; color:white; border-radius:10px; text-decoration:none;">Back to Logs</a>
            <br><br>
            <a href="/admin.html" style="padding:10px 20px; background:hotpink; color:white; border-radius:10px; text-decoration:none;">Back to Admin Page</a>
        </body>
    `);
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
