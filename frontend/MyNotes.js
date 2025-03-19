const API_URL = "http://localhost:8080/api/notes";

// ✅ Save Note
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
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save the note.");
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

// ✅ Load Notes
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
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to load notes.");
        }

        const notes = await response.json();
        const list = document.getElementById("notesList");
        list.innerHTML = "";  // Clear the existing list

        if (notes.length === 0) {
            list.innerHTML = "<li>No notes found.</li>";
            return;
        }

        notes.forEach(note => {
            const li = document.createElement("li");
            li.textContent = `${note.title} (Next Review: ${new Date(note.nextReviewDate).toLocaleDateString()})`; // Display the next review date
            li.classList.add('note-item');
            li.style.cursor = "pointer"; // Make it look clickable
            li.onclick = () => openReviewSection(note); // Handle click to open review section
            list.appendChild(li);
        });
    } catch (error) {
        alert(error.message);
        console.error("Error:", error);
    }
}

// ✅ Open Review Section
function openReviewSection(note) {
    // Set the note details in the review section
    document.getElementById("noteTitle").textContent = note.title;
    document.getElementById("noteContent").textContent = note.content;
    document.getElementById("nextReviewDate").textContent = new Date(note.nextReviewDate).toLocaleDateString();
    document.getElementById("noteDetailsSection").style.display = "block"; // Show the review section

    // Store the note ID in the session so we can submit the review later
    sessionStorage.setItem("currentNoteId", note.id);
}

// ✅ Submit Review
async function submitReview() {
    const noteId = sessionStorage.getItem("currentNoteId");
    const quality = document.getElementById("reviewQuality").value;
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${noteId}/review?quality=${quality}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to submit review.");
        }

        alert("Review submitted successfully!");
        closeReviewSection(); // Close review section after submission
        loadNotes(); // Reload notes list
    } catch (error) {
        alert(error.message);
        console.error("Error:", error);
    }
}

// ✅ Close Review Section
function closeReviewSection() {
    document.getElementById("noteDetailsSection").style.display = "none"; // Hide the review section
}

// ✅ Search Notes
function searchNotes() {
    const query = document.getElementById("searchInput").value.trim();
    const noteItems = document.getElementById("notesList").getElementsByClassName("note-item");

    Array.from(noteItems).forEach(item => {
        const title = item.textContent.toLowerCase();
        const isMatch = title.includes(query.toLowerCase());
        item.style.display = isMatch ? "block" : "none";
    });
}

// Load notes when the page is loaded
window.onload = loadNotes;
