from flask import Flask, request, render_template

app = Flask(__name__)

USERNAME = "admin"
PASSWORD = "password123"
LOGFILE = "failed.log"

def log_failed(ip, user):
    with open(LOGFILE, "a") as f:
        f.write(f"FAILED LOGIN - IP: {ip}, USER: {user}\n")

@app.route("/", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        user = request.form["username"]
        pwd = request.form["password"]
        ip = request.remote_addr

        if user == USERNAME and pwd == PASSWORD:
            return "Login Successful!"
        else:
            log_failed(ip, user)
            return "Invalid credentials!"

    return render_template("login.html")

if __name__ == "__main__":
    app.run(debug=True)
