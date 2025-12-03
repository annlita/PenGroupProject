const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Load users
function loadUsers() {
    const filePath = path.join(__dirname, "users.json");
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
}
const users = loadUsers();

// Log file (ALL attempts)
const logFile = path.join(__dirname, "login_logs.txt");
if (!fs.existsSync(logFile)) fs.writeFileSync(logFile, "");

// Email setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "annlitajoshy@gmail.com",
        pass: "abkq wwlk ohct kbdk"   // NOT your real password
    }
});

// --- LOGIN ROUTE ---
app.post("/login", (req, res) => {
    const { username, password } = req.body;

    const validUser = users.find(
        (u) => u.username === username && u.password === password
    );

    // LOG EVERY attempt
    const status = validUser ? "SUCCESS" : "FAILED";
    const entry = `${status} | User: ${username} | Time: ${new Date().toISOString()}\n`;
    fs.appendFileSync(logFile, entry);

    // If FAILED → send email alert
    if (!validUser) {
        transporter.sendMail({
            from: "annlitajoshy@gmail.com",
            to: "annlitajoshyaykara@ontariotechu.net",
            subject: "⚠ Failed Login Attempt Detected",
            text: `A failed login attempt occurred.\nUser: ${username}\nTime: ${new Date().toISOString()}`
        });

        const loginPage = fs.readFileSync("./public/index.html", "utf8");
        const injected = loginPage.replace(
            `<div class="login-box">`,
            `<div class="login-box">
                <p class="error">❌ Incorrect username or password</p>`
        );
        return res.send(injected);
    }

    // SUCCESS — redirect based on user
    if (username === "admin" && password === "1234") {
        return res.redirect("/admin.html");
    }

    return res.redirect("/success.html");
});

// Show logs
app.get("/logs", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "logs.html"));
});

// Return log contents
app.get("/get-logs", (req, res) => {
    const logs = fs.readFileSync(logFile, "utf8");
    res.send(logs);
});

// Clear logs
app.get("/clear-logs", (req, res) => {
    fs.writeFileSync(logFile, "");
    res.send(`
        <h1>Logs Cleared ✔</h1>
        <a href="/logs">Back to Logs</a><br>
        <a href="/admin.html">Back to Admin</a>
    `);
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
