function loadNotes() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        alert("You are not logged in!");
        window.location.href = "login.html";
        return;
    }

    fetch("http://localhost:8080/api/notes", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(notes => {
        const list = document.getElementById("notesList");
        list.innerHTML = "";
        notes.sort((a, b) => new Date(a.nextReviewDate) - new Date(b.nextReviewDate));

        notes.forEach(note => {
            const li = document.createElement("li");
            li.classList.add("note-item");
            li.innerHTML = `<input type="text" value="${note.title}" onchange="updateNote('${note.id}', this.value)">`;
            list.appendChild(li);
        });
    })
    .catch(error => console.error("Error:", error));
}


function searchNotes() {
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const notes = document.querySelectorAll(".note-item");

    notes.forEach(note => {
        if (note.textContent.toLowerCase().includes(searchValue)) {
            note.style.display = "block";
        } else {
            note.style.display = "none";
        }
    });
}


function updateNote(id, newTitle) {
    const token = localStorage.getItem("jwtToken");

    fetch(`http://localhost:8080/api/notes/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ title: newTitle })
    })
    .then(response => response.json())
    .then(data => console.log("Updated:", data))
    .catch(error => console.error("Error:", error));
}
