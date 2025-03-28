const API_URL = "http://localhost:8080/api/notes";

// Save Note
async function saveNote() {
    const title = document.getElementById("title").value.trim();
    const content = document.getElementById("content").value.trim();
    const token = localStorage.getItem("jwtToken"); // Get stored JWT token

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    // Prevent saving empty notes
    if (!title || !content) {
        alert("Title and content cannot be empty.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, nextReviewDate: new Date().toISOString() })
        });

        if (!response.ok) {
            throw new Error("Failed to save the note.");
        }

        const data = await response.json();
        console.log("Note saved:", data);

        alert("Note saved successfully!");
        document.getElementById("title").value = "";  // Clear input fields
        document.getElementById("content").value = "";
        
        loadNotes(); // Reload notes list
    } catch (error) {
        alert(error.message);
        console.error("Error:", error);
    }
}

// Load Notes
async function loadNotes() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Failed to load notes.");
        }

        const notes = await response.json();
        const list = document.getElementById("notesList");
        list.innerHTML = "";

        if (notes.length === 0) {
            list.innerHTML = "<li>No notes found.</li>";
            return;
        }

        notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = `${note.title}: ${note.content}`;
            list.appendChild(li);
        });
    } catch (error) {
        alert(error.message);
        console.error("Error:", error);
    }
}

// Attach event listeners on page load
document.addEventListener("DOMContentLoaded", loadNotes);
