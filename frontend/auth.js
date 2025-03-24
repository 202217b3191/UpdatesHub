
document.addEventListener("DOMContentLoaded", () => {
    console.log("📌 Auth.js Loaded...");

    setTimeout(() => {
        const token = localStorage.getItem("jwtToken");

        if (!token) {
            console.warn("🚨 No token found, user must log in.");
            // ✅ Prevent redirect on register page
            if (!window.location.href.includes("login.html") && !window.location.href.includes("register.html")) {
                window.location.href = "login.html";
            }
        } else {
            console.log("✅ Token found:", token);
        }
    }, 300);

    document.body.addEventListener("click", (event) => {
        if (event.target.id === "loginBtn") loginUser();
        if (event.target.id === "registerBtn") registerUser();
    });
});


function loginUser() {
    const usernameInput = document.getElementById("loginUsername");
    const passwordInput = document.getElementById("loginPassword");

    if (!usernameInput || !passwordInput) {
        console.error("❌ Login input fields not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(async (response) => { // Make this async
        if (!response.ok) {
          const errorData = await response.json(); // Get error details
          throw new Error(`Login failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem("jwtToken", data.token);
            alert("✅ Login successful!");
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            //  This case is likely redundant, given the error handling above.
            alert("❌ Invalid credentials, please try again.");
        }
    })
    .catch(error => {
        console.error("❌ Error:", error);
        alert(error.message); // Display the error message to the user
    });
}

async function registerUser() {
    const usernameInput = document.getElementById("registerUsername");
    const passwordInput = document.getElementById("registerPassword");

    if (!usernameInput || !passwordInput) {
        console.error("❌ Register input fields not found.");
        return;
    }

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("⚠️ Username and password cannot be empty!");
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        // ✅ Handle 409 Conflict (User Already Exists)
        if (response.status === 409) {
            throw new Error("⚠️ User already exists! Try a different username.");
        }

        // ✅ Check content type before parsing JSON
        const contentType = response.headers.get("Content-Type");
        let data = null;
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            throw new Error(await response.text()); // Read error as plain text
        }

        if (data.token) {
            localStorage.setItem("jwtToken", data.token);
            alert("✅ Registration successful! Redirecting to dashboard...");
            window.location.href = "dashboard.html";
        } else {
            alert("✅ Registration successful! You can now log in.");
            window.location.href = "login.html";
        }
    } catch (error) {
        console.error("❌ Error:", error);
        alert(error.message);
    }
}

// ✅ Logout Function (This is correct, and should stay here)
function logout() {
    localStorage.removeItem("jwtToken");
    sessionStorage.clear(); // Good practice to clear sessionStorage too
    alert("✅ Logged out successfully!");
    window.location.href = "login.html"; // Redirect to login page
}

// Export the logout function so dashboard.js can use it.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { logout };
}