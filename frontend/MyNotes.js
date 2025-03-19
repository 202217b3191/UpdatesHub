document.addEventListener("DOMContentLoaded", function () {
    loadNotes();

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", logout);
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", searchNotes);
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
        alert("⚠️ Failed to load notes. Please try again.");
        logout(); // Redirect to login page on critical errors
    }
}

// ✅ Display Notes Function
function displayNotes(notes) {
    const notesList = document.getElementById("notesList");
    notesList.innerHTML = '';

    notes.forEach(note => {
        const li = document.createElement('li');
        li.className = 'note-item';
        li.id = `note-${note.id}`;

        const noteTitle = document.createElement('span');
        noteTitle.textContent = note.title;

        const nextReview = document.createElement('span');
        nextReview.className = 'next-review';
        nextReview.textContent = `Next Review: ${new Date(note.nextReviewDate).toDateString()}`;

        const reviewButton = document.createElement('button');
        reviewButton.className = 'review-btn';
        reviewButton.textContent = 'Review Now';
        reviewButton.setAttribute('data-note-id', note.id);
        reviewButton.onclick = () => openReviewModal(note.id);

        li.appendChild(noteTitle);
        li.appendChild(nextReview);
        li.appendChild(reviewButton);
        notesList.appendChild(li);
    });
}

// ✅ Open Review Modal
function openReviewModal(noteId) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'modalTitle');
    modal.innerHTML = `
        <div class="modal-content">
            <h3 id="modalTitle">Review Note</h3>
            <button aria-label="Easy" onclick="rateQuality(1)">Easy</button>
            <button aria-label="Good" onclick="rateQuality(2)">Good</button>
            <button aria-label="Hard" onclick="rateQuality(3)">Hard</button>
            <button aria-label="Close" onclick="closeReviewModal()">Close</button>
        </div>
    `;

    document.body.appendChild(modal);
    localStorage.setItem('currentNoteId', noteId);  // Store noteId for later review submission
}

// ✅ Rate Quality and Submit Review
async function submitReview(noteId, quality) {
    const data = { noteId: noteId, quality: quality };

    const response = await fetch('http://localhost:8080/api/review', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(`🚨 HTTP error! Status: ${response.status}`);
    }

    return response.json();
}

function rateQuality(quality) {
    const noteId = localStorage.getItem('currentNoteId');

    submitReview(noteId, quality)
        .then(updatedNote => {
            loadNotes();  // Reload notes after updating the review cycle
            closeReviewModal();  // Close the review modal
        })
        .catch(error => {
            console.error('❌ Error updating review cycle:', error);
            alert("⚠️ Failed to update review. Please try again.");
        });
}

// ✅ Close Review Modal
function closeReviewModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
    localStorage.removeItem('currentNoteId');  // Clear the stored noteId
}

// ✅ Search Notes Function
async function searchNotes() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const token = localStorage.getItem("jwtToken");

    if (!searchTerm.trim()) {
        loadNotes(); // Reload notes if the search term is empty
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/notes/search?q=${searchTerm}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`🚨 HTTP error! Status: ${response.status}`);
        }

        const notes = await response.json();
        displayNotes(notes);

    } catch (error) {
        console.error("❌ Error:", error);
        alert("⚠️ Failed to search notes. Please try again.");
    }
}

// ✅ Logout Function
function logout() {
    localStorage.removeItem("jwtToken");
    sessionStorage.clear();
    window.location.href = "login.html";
}
