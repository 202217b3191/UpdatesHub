document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
        loginBtn.addEventListener("click", loginUser);
    }

    const registerBtn = document.getElementById("registerBtn");
    if (registerBtn) {
        registerBtn.addEventListener("click", registerUser);
    }
});

function loginUser() {
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");

    if (!usernameInput || !passwordInput) {
        console.error("Login input fields not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.token) {
            localStorage.setItem("jwtToken", data.token);
            alert("Login successful!");
            window.location.href = "index.html";
        } else {
            alert("Invalid credentials, please try again.");
        }
    })
    .catch(error => console.error("Error:", error));
}

function registerUser() {
    const usernameInput = document.getElementById("registerUsername");
    const passwordInput = document.getElementById("registerPassword");

    if (!usernameInput || !passwordInput) {
        console.error("Register input fields not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
    })
    .catch(error => console.error("Error:", error));
}
