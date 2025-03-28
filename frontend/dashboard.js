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
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("jwtToken");
        window.location.href = "login.html";
    });

    // Load dashboard data
    try {
        console.log("🟢 Fetching dashboard data...");
        await Promise.all([loadUpcomingReviews(), loadBlackouts()]);
    } catch (error) {
        console.error("❌ Error loading dashboard data:", error);
    }

    // Handle blackout form submission
    document.getElementById("blackout-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        await submitBlackout();
    });
});

//Generic function to make API calls with JWT Authorization
async function fetchWithToken(url, options = {}) {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("🚨 No JWT Token Found! User might not be authenticated.");
        alert("⚠️ You need to log in first!");
        return Promise.reject(new Error("No token found"));
    }

    // Default headers with JWT token
    const headers = new Headers({
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,  // Merge custom headers if provided
    });

    console.log(`📡 Fetching: ${url} with method ${options.method || "GET"}`);

    try {
        const response = await fetch(url, { ...options, headers });

        if (response.status === 403) {
            console.error("❌ Access Denied (403) - Unauthorized access.");
            alert("⚠️ You don't have permission to access this resource.");
            return Promise.reject(new Error("403 Forbidden"));
        }

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Error ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${errorText || "Unknown error"}`);
        }

        return response.json();
    } catch (error) {
        console.error("❌ Fetch failed:", error.message);
        return Promise.reject(error);
    }
}

// Load upcoming reviews
async function loadUpcomingReviews() {
    console.log("🟢 Loading upcoming reviews...");

    try {
        const data = await fetchWithToken("http://localhost:8080/api/notes/upcoming-reviews");
        console.log("📌 Upcoming Reviews Data:", data);
        updateReviewList(data);
    } catch (error) {
        console.error("❌ Error loading upcoming reviews:", error);
    }
}

// Load blackout schedules
async function loadBlackouts() {
    console.log("🟢 Loading blackouts...");

    try {
        const data = await fetchWithToken("http://localhost:8080/api/blackout");

        if (!data || data.length === 0) {
            console.warn("⚠️ No blackout schedules found.");
            updateBlackoutList([]); // Clear the UI list
            return;
        }

        console.log("✅ Blackout Schedules Loaded:", data);
        updateBlackoutList(data);
    } catch (error) {
        console.error("❌ Error loading blackouts:", error);
        alert("⚠️ Failed to load blackout schedules.");
    }
}

// Submit blackout schedule
async function submitBlackout() {
    console.log("🟢 Submitting blackout...");

    const blackoutName = document.getElementById("blackout-name").value.trim();
    const blackoutStart = document.getElementById("blackout-start").value;
    const blackoutEnd = document.getElementById("blackout-end").value;
    const blackoutUser = document.getElementById("blackout-user").value.trim();  // Likely unnecessary

    if (!blackoutName || !blackoutStart || !blackoutEnd) {
        alert("⚠️ All fields are required!");
        return;
    }

    try {
        const data = await fetchWithToken("http://localhost:8080/api/blackout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: blackoutName,
                start: blackoutStart,
                end: blackoutEnd,
                username: blackoutUser,  // Make sure backend expects this
            }),
        });

        console.log("✅ Blackout added successfully:", data);
        alert("✅ Blackout successfully added!");

        await loadBlackouts();  // Refresh blackout list after submission
        document.getElementById("blackout-form").reset();
    } catch (error) {
        console.error("❌ Error adding blackout:", error);
        alert(`⚠️ Failed to add blackout: ${error.message}`);
    }
}

function updateReviewList(data) {
    const reviewsDiv = document.getElementById("upcoming-reviews");

    if (!Array.isArray(data) || data.length === 0) {
        reviewsDiv.innerHTML = "<p>No upcoming reviews.</p>";
        return;
    }

    reviewsDiv.innerHTML = `<ul>
        ${data.map(review => `
            <li>
                Review for <strong>${review.title || "Untitled Note"}</strong> 
                on <strong>${review.nextReviewDate ? new Date(review.nextReviewDate).toLocaleString() : "Invalid Date"}</strong>
            </li>
        `).join('')}
    </ul>`;
}


//Update the UI with blackout schedules
function updateBlackoutList(data) {
    const blackoutList = document.getElementById("blackout-list");
    blackoutList.innerHTML = data.length
        ? data.map(blackout => `
            <li>
                <strong>${blackout.name}</strong> - 
                Start: ${new Date(blackout.start).toLocaleString()}, 
                End: ${new Date(blackout.end).toLocaleString()}, 
                Applied by: ${blackout.user}
            </li>
        `).join('')
        : "<li>No blackout windows scheduled.</li>";
}
