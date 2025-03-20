// Open Create Note Modal
function openCreateNoteModal() {
    const modal = document.getElementById('createNoteModal');
    modal.style.display = 'block';
}

// Close Create Note Modal
function closeCreateNoteModal() {
    const modal = document.getElementById('createNoteModal');
    modal.style.display = 'none';
}

// Create New Note
async function createNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    if (!title || !content) {
        alert("Please fill in both fields!");
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
    } catch (error) {
        console.error("❌ Error:", error);
        alert("❌ Failed to create the note.");
    }
}
