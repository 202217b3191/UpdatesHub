const API_URL = "http://localhost:8080/api/notes";

// Utility function to encode HTML entities
function encodeHTML(str) {
    let encoded = "";
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        switch (char) {
            case '<': encoded += '<'; break; // Corrected: <
            case '>': encoded += '>'; break; // Corrected: >
            case '"': encoded += '"'; break;
            case "'": encoded += '&#39'; break;
            case '&': encoded += '&'; break;
            default: encoded += char;
        }
    }
    return encoded;
}

// Load Notes on Page Load - Use DOMContentLoaded, not load
document.addEventListener("DOMContentLoaded", loadNotes); 

// Load Notes (Updated for Modal View)
async function loadNotes() {
    const token = localStorage.getItem("jwtToken");

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401 || response.status === 403) {
            alert("Unauthorized. Please log in again.");
            return;
        }
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to load notes: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        const notes = await response.json();
        const list = document.getElementById("notesList");

        if (!list) {
            console.error("Error: notesList element not found.");
            return;
        }

        list.innerHTML = ""; // Clear existing list

        if (notes.length === 0) {
            list.innerHTML = "<li class='empty-note'>No notes found.</li>";
            return;
        }

        notes.forEach(note => {
            const li = document.createElement("li");
            li.classList.add("note-item"); // Add a class for styling

            const encodedTitle = encodeHTML(note.title);
            const encodedContent = encodeHTML(note.content);

            
            let nextReviewDate = "N/A";
            if (note.nextReviewDate) {
                try {
                    nextReviewDate = new Date(note.nextReviewDate).toLocaleDateString();
                } catch (error) {
                    console.error("Error parsing nextReviewDate:", note.nextReviewDate, error);
                }
            }

            li.innerHTML = `
                <span class="note-title" data-note-id="${note.id}" data-note-title="${encodedTitle}" data-note-content="${encodedContent}" data-note-next-review="${nextReviewDate}">
                    ${encodedTitle}
                </span>
                <span class="next-review">Next Review: ${nextReviewDate}</span>
            `;

            list.appendChild(li);

            
            li.addEventListener("click", function () {
                const noteId = this.querySelector(".note-title").dataset.noteId;
                const noteTitle = this.querySelector(".note-title").dataset.noteTitle;
                const noteContent = this.querySelector(".note-title").dataset.noteContent;
                const noteNextReview = this.querySelector(".note-title").dataset.noteNextReview;
                openNoteModal(noteId, noteTitle, noteContent, noteNextReview);
            });
        });
    } catch (error) {
        console.error("Error loading notes:", error);
        alert(`Error loading notes: ${error.message}`);
    }
}

// Open Note Modal for Viewing & Managing Notes
function openNoteModal(id, title, content, nextReviewDate) {
    sessionStorage.setItem("selectedNoteId", id);

    const modalTitle = document.getElementById("modalTitle");
    const modalContent = document.getElementById("modalContent");
    const modalNextReview = document.getElementById("modalNextReview");
    const editTitleInput = document.getElementById("editTitle");
    const editContentTextarea = document.getElementById("editContent");

    if (modalTitle) modalTitle.innerText = decodeHTML(title);
    if (modalContent) modalContent.innerText = decodeHTML(content);
    if (modalNextReview) modalNextReview.innerText = nextReviewDate; 
    if (editTitleInput) editTitleInput.value = decodeHTML(title); 
    if (editContentTextarea) editContentTextarea.value = decodeHTML(content);

    document.getElementById("editNoteSection").style.display = "none"; 
    document.getElementById("noteModal").classList.add("show"); 
}

function decodeHTML(str) {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(str, 'text/html').body.textContent;
    return decodedString;
}

// Close Modal
document.getElementById("closeModalBtn").addEventListener("click", closeModal);

function closeModal() {
    document.getElementById("noteModal").classList.remove("show");
}

// Edit Note
document.getElementById("editButton").addEventListener("click", editNote);

function editNote() {
    document.getElementById("editNoteSection").style.display = "block";
}

// Update Note
document.getElementById("updateButton").addEventListener("click", updateNote);

async function updateNote() {
    const noteId = sessionStorage.getItem("selectedNoteId");
    const title = document.getElementById("editTitle").value.trim();
    const content = document.getElementById("editContent").value.trim();
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
		if (response.status === 401 || response.status === 403) {
            alert("Unauthorized. Please log in again.");
             
             return;
        }
        if (!response.ok) {
              const errorData = await response.json();
            throw new Error(`Failed to update note: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        alert("Note updated successfully!");
        closeModal();
        loadNotes();
    } catch (error) {
        console.error("Error updating note:", error);
        alert(`Error updating note: ${error.message}`);
    }
}

// Delete Note
document.getElementById("deleteButton").addEventListener("click", deleteNote);

async function deleteNote() {
    const noteId = sessionStorage.getItem("selectedNoteId");
    const token = localStorage.getItem("jwtToken");

    if (!confirm("Are you sure you want to delete this note?")) return;

    try {
        const response = await fetch(`${API_URL}/${noteId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

		if (response.status === 401 || response.status === 403) {
            alert("Unauthorized. Please log in again.");
             
             return;
        }
        if (!response.ok) {
              const errorData = await response.json();
            throw new Error(`Failed to delete note: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        alert("Note deleted successfully!");
        closeModal();
        loadNotes();
    } catch (error) {
        console.error("Error deleting note:", error);
        alert(`Error deleting note: ${error.message}`);
    }
}

// Submit Review (Spaced Repetition)
document.getElementById("submitReviewButton").addEventListener("click", submitReview);

async function submitReview() {
    const noteId = sessionStorage.getItem("selectedNoteId");
    const quality = document.getElementById("reviewQuality").value;
    const token = localStorage.getItem("jwtToken");

    if (!noteId || !quality) {
        alert("Please select a review quality.");
        return;
    }

    console.log("Submitting review with quality:", quality, "for note ID:", noteId);
    console.log("Token:", token);

    try {
        const response = await fetch(`${API_URL}/${noteId}/review?quality=${quality}`, { //  Corrected URL
            method: "POST", 
            headers: {
                
                "Authorization": `Bearer ${token}`
            },
            
        });
		if (response.status === 401 || response.status === 403) {
            alert("Unauthorized. Please log in again.");
             
             return;
        }
        if (!response.ok) {
              const errorData = await response.json();
            throw new Error(`Failed to submit review: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }
        alert("Review submitted successfully!");
        closeModal();
        loadNotes();
    } catch (error) {
        console.error("Error submitting review:", error);
        alert(`Error submitting review: ${error.message}`);
    }
}

//Search Notes
document.getElementById("searchButton").addEventListener("click", searchNotes);

function searchNotes() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const notes = document.querySelectorAll("#notesList li");

    notes.forEach(note => {
        const noteTitle = note.querySelector(".note-title").dataset.noteTitle.toLowerCase();
        const noteContent = note.querySelector(".note-title").dataset.noteContent.toLowerCase();

        if (noteTitle.includes(query) || noteContent.includes(query)) {
            note.style.display = "block";
        } else {
            note.style.display = "none";
        }
    });
}

document.getElementById("cancelButton").addEventListener("click", closeModal);