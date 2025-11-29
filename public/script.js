 let logs = [];

function attemptLogin() {
    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    let timestamp = new Date().toLocaleString();

    let entry = `FAILED LOGIN | user=${user} | pass=${pass} | time=${timestamp}`;
    logs.push(entry);

    document.getElementById("logBox").textContent = logs.join("\n");
}

// Download as .txt
function downloadLogs() {
    let blob = new Blob([logs.join("\n")], { type: "text/plain" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "failed_logins.txt";
    link.click();
}