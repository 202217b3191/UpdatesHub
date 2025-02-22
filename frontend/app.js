const API_URL = "http://localhost:8080/api/notes";
const username = "admin";  // Replace with your actual username
const password = "password";  // Replace with your actual password

function saveNote() {
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;

    fetch("http://localhost:8080/api/notes", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": "Basic " + btoa("admin:password") 
        },
        body: JSON.stringify({ title, content, nextReviewDate: new Date().toISOString() }) // Ensure correct date format
    })
    .then(response => {
        console.log("Response Status:", response.status);
        return response.json().catch(() => { throw new Error("Invalid JSON response") });
    })
    .then(data => {
        console.log("Response Data:", data);
        loadNotes();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to save note. Check console for details.");
    });
}


function loadNotes() {
    fetch(API_URL, {
        method: "GET",
        headers: { 
            "Authorization": "Basic " + btoa(username + ":" + password)  // Include credentials
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to load notes");
        }
        return response.json();
    })
    .then(notes => {
        const list = document.getElementById("notesList");
        list.innerHTML = "";
        notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = `${note.title}: ${note.content}`;
            list.appendChild(li);
        });
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Failed to load notes. Check the console for details.");
    });
}

document.addEventListener("DOMContentLoaded", loadNotes);
