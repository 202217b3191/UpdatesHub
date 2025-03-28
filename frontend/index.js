// Ensure user is authenticated when loading index page
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.warn("🔴 No token found! Redirecting to login...");
        window.location.href = "login.html"; // Redirect if not logged in
        return;
    }

    console.log("🟢 User is logged in. Token found.");
});

// Open Create Note Modal
function openCreateNoteModal() {
    const modal = document.getElementById('createNoteModal');
    if (modal) {
        modal.style.display = 'block';
    } else {
        console.error("❌ Create Note Modal not found!");
    }
}

// Close Create Note Modal
function closeCreateNoteModal() {
    const modal = document.getElementById('createNoteModal');
    if (modal) {
        modal.style.display = 'none';
    } else {
        console.error("❌ Create Note Modal not found!");
    }
}

// Create New Note
async function createNote() {
    const title = document.getElementById('noteTitle').value.trim();
    const content = document.getElementById('noteContent').value.trim();

    if (!title || !content) {
        alert("⚠️ Please fill in both fields!");
        return;
    }

    const token = localStorage.getItem("jwtToken");

    if (!token) {
        alert("⚠️ Access Denied! Please log in.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/notes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        if (!response.ok) {
            throw new Error(`🚨 HTTP error! Status: ${response.status}`);
        }

        alert("✅ Note created successfully!");
        closeCreateNoteModal(); // Close modal after creating note
        window.location.reload(); // Refresh to show the new note
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Failed to create the note.");
    }
}

// Logout Function
function logout() {
    localStorage.removeItem("jwtToken");
    sessionStorage.clear();
    alert("✅ Logged out successfully!");
    window.location.href = "login.html"; // Redirect to login page
}

// Attach event listeners for logout
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }
});
