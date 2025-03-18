document.addEventListener("DOMContentLoaded", function () {
    loadNotes();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});

// ✅ Load Notes Function
async function loadNotes() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        alert("⚠️ Access Denied! Please log in.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/notes", {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 403) {
            alert("⛔ Session Expired! Please log in again.");
            logout(); // Call logout function
            return;
        }

        if (!response.ok) {
            throw new Error(`🚨 HTTP error! Status: ${response.status}`);
        }

        const notes = await response.json();
        displayNotes(notes);

    } catch (error) {
        console.error("❌ Error:", error);
    }
}

// ✅ Logout Function (Same as in auth.js)
function logout() {
    localStorage.removeItem("jwtToken");
    sessionStorage.clear();
    window.location.href = "login.html";
}
