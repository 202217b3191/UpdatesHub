const API_BASE_URL = "http://localhost:8080/api/auth"; // Backend auth URL

// Register new user
function registerUser() {
    const username = document.getElementById("registerUsername").value;
    const password = document.getElementById("registerPassword").value;

    fetch(`${API_BASE_URL}/register`, {
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

// Login user
function loginUser() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    fetch(`${API_BASE_URL}/login`, {
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

// Logout user
document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("jwtToken");
    window.location.href = "login.html";
});
