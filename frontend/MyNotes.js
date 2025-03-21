// ✅ Define API_URL at the top
const API_URL = "http://localhost:8080/api/notes"; // Change this if your backend URL is different

// ✅ Load Notes on Page Load
window.onload = loadNotes;

// ✅ Load Notes (Includes Edit and Delete Buttons)
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

        if (!list) {
            console.error("Error: notesList element not found.");
            return;
        }

        list.innerHTML = "";

        if (notes.length === 0) {
            list.innerHTML = "<li>No notes found.</li>";
            return;
        }

        notes.forEach(note => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${note.title} (Next Review: ${new Date(note.nextReviewDate).toLocaleDateString()})
                <button onclick="editNote('${note.id}', '${note.title.replace(/'/g, "\\'")}', '${note.content.replace(/'/g, "\\'")}')">✏️ Edit</button>
                <button onclick="deleteNote('${note.id}')">❌ Delete</button>
            `;
            list.appendChild(li);
        });
    } catch (error) {
        console.error("Error loading notes:", error);
        alert(error.message);
    }
}

// ✅ Edit Note
function editNote(id, title, content) {
    const editSection = document.getElementById("editNoteSection");
    const titleInput = document.getElementById("editTitle");
    const contentInput = document.getElementById("editContent");

    if (!editSection || !titleInput || !contentInput) {
        console.error("Error: Edit note section elements not found.");
        return;
    }

    editSection.style.display = "block";
    titleInput.value = title;
    contentInput.value = content;
    sessionStorage.setItem("editNoteId", id);
}

// ✅ Update Note
async function updateNote() {
    const noteId = sessionStorage.getItem("editNoteId");
    const title = document.getElementById("editTitle")?.value.trim();
    const content = document.getElementById("editContent")?.value.trim();
    const token = localStorage.getItem("jwtToken");

    if (!noteId || !title || !content) {
        alert("Title and content cannot be empty.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${noteId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ title, content, nextReviewDate: new Date().toISOString() })
        });

        if (!response.ok) {
            throw new Error("Failed to update note.");
        }

        alert("Note updated successfully!");
        closeEditSection();
        loadNotes();
    } catch (error) {
        console.error("Error updating note:", error);
        alert(error.message);
    }
}

// ✅ Close Edit Section
function closeEditSection() {
    const editSection = document.getElementById("editNoteSection");
    if (editSection) editSection.style.display = "none";
}

// ✅ Delete Note
async function deleteNote(noteId) {
    const token = localStorage.getItem("jwtToken");

    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
        const response = await fetch(`${API_URL}/${noteId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error("Failed to delete note.");
        }

        alert("Note deleted successfully!");
        loadNotes();
    } catch (error) {
        console.error("Error deleting note:", error);
        alert(error.message);
    }
}
