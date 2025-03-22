document.addEventListener("DOMContentLoaded", () => {
    // --- Authentication Check (Moved from dashboard.js) ---
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.log("No token found in auth.js, redirecting.");
        window.location.href = "login.html";
        return; //  Important: Stop further execution in auth.js
    } else {
        console.log("Token found in auth.js:", token);
    }
    // --- End Authentication Check ---


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

function registerUser() {
    const usernameInput = document.getElementById("registerUsername");
    const passwordInput = document.getElementById("registerPassword");

    if (!usernameInput || !passwordInput) {
        console.error("❌ Register input fields not found.");
        return;
    }

    const username = usernameInput.value;
    const password = passwordInput.value;

    fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })
    .then(async (response) => {  // Make this async
      if(!response.ok){
        const errorData = await response.json();
        throw new Error(`Registration failed: ${response.status} - ${errorData.message || "Unknown Error"}`);
      }
        return response.json();
    })
    .then(() => {
        alert("✅ Registration successful! You can now log in.");
        window.location.href = "login.html";
    })
    .catch(error => {
        console.error("❌ Error:", error);
        alert(error.message); // Display the error message
    });
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