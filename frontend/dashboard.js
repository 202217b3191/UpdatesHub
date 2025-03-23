document.addEventListener("DOMContentLoaded", async () => {
    console.log("📌 Dashboard Loaded...");

    // Check if token exists before making API calls
    const token = localStorage.getItem("jwtToken");
    if (!token) {
        console.warn("🚨 No token found! Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    // Logout button functionality
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
        });
    }

    // Use `Promise.all` to load both API calls simultaneously
    try {
        console.log("🟢 Fetching data in parallel...");
        await Promise.all([loadUpcomingReviews(), loadBlackouts()]);
    } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
    }

    // Blackout form submission handler
    const blackoutForm = document.getElementById("blackout-form");
    if (blackoutForm) {
        blackoutForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            await submitBlackout();
        });
    }
});

// ✅ Function to load upcoming reviews with API throttling protection
async function loadUpcomingReviews() {
    console.log("🟢 Loading upcoming reviews...");
    const token = localStorage.getItem("jwtToken");
    if (!token) return console.warn("🚨 No token found!");

    try {
        const response = await fetchWithToken("http://localhost:8080/api/upcoming-reviews");
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const data = await response.json();
        console.log("📌 Upcoming Reviews Data:", data);

        // ✅ Efficiently update the UI
        updateReviewList(data);
    } catch (error) {
        console.error("❌ Error loading upcoming reviews:", error);
    }
}

// ✅ Function to load blackouts with API throttling protection
async function loadBlackouts() {
    console.log("🟢 Loading blackouts...");
    const token = localStorage.getItem("jwtToken");
    if (!token) return console.warn("🚨 No token found!");

    try {
        const response = await fetchWithToken("http://localhost:8080/api/blackout");
        if (!response.ok) throw new Error(`HTTP Error ${response.status}`);

        const data = await response.json();
        console.log("✅ Blackout Schedules:", data);

        // ✅ Efficiently update the UI
        updateBlackoutList(data);
    } catch (error) {
        console.error("❌ Error loading blackouts:", error);
    }
}

// ✅ Unified function to handle API requests with token
async function fetchWithToken(url) {
    const token = localStorage.getItem("jwtToken");
    return fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });
}

// ✅ Function to submit blackout form
async function submitBlackout() {
    console.log("🟢 Submitting blackout...");

    const blackoutName = document.getElementById("blackout-name").value;
    const blackoutStart = document.getElementById("blackout-start").value;
    const blackoutEnd = document.getElementById("blackout-end").value;
    const blackoutUser = document.getElementById("blackout-user").value;
    const token = localStorage.getItem("jwtToken");

    try {
        const response = await fetch("http://localhost:8080/api/blackout", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: blackoutName,
                start: blackoutStart,
                end: blackoutEnd,
                user: blackoutUser,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP ${response.status}: ${errorData.message || "Unknown error"}`);
        }

        console.log("✅ Blackout added successfully.");
        await loadBlackouts(); // Refresh blackout list after submission
        document.getElementById("blackout-form").reset();
    } catch (error) {
        console.error("❌ Error adding blackout:", error);
        alert(`⚠️ Failed to add blackout: ${error.message}`);
    }
}

// ✅ Efficiently update upcoming reviews list
function updateReviewList(data) {
    const reviewsDiv = document.getElementById("upcoming-reviews");
    reviewsDiv.innerHTML = data.length
        ? `<ul>${data.map(review => `<li>Review for ${review.noteTitle} on ${new Date(review.reviewDate).toLocaleString()}</li>`).join('')}</ul>`
        : "<p>No upcoming reviews.</p>";
}

// ✅ Efficiently update blackout list
function updateBlackoutList(data) {
    const blackoutList = document.getElementById("blackout-list");
    blackoutList.innerHTML = data.length
        ? data.map(blackout => `<li>${blackout.name} - Start: ${new Date(blackout.start).toLocaleString()}, End: ${new Date(blackout.end).toLocaleString()}, Applied by: ${blackout.user}</li>`).join('')
        : "<li>No blackout windows scheduled.</li>";
}
