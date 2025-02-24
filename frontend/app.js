const API_URL = "http://localhost:8080/api/notes";

// Save Note
function saveNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const token = localStorage.getItem("jwtToken"); // Get stored JWT token

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content, nextReviewDate: new Date().toISOString() })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Note saved:", data);
        loadNotes();
    })
    .catch(error => console.error("Error:", error));
}

// Load Notes
function loadNotes() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    fetch(API_URL, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(notes => {
        const list = document.getElementById("notesList");
        list.innerHTML = "";
        notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = `${note.title}: ${note.content}`;
            list.appendChild(li);
        });
    })
    .catch(error => console.error("Error:", error));
}

document.addEventListener("DOMContentLoaded", loadNotes);
