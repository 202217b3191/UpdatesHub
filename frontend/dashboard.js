async function loadUpcomingReviews() {
    console.log("🟢 Loading upcoming reviews...");
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("❌ No token found! Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    console.log("🟢 Token found:", token);

    try {
        console.log("🟢 Making request to /api/upcoming-reviews...");
        const response = await fetch("http://localhost:8080/api/upcoming-reviews", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`🔹 Response status for upcoming reviews: ${response.status}`);

        if (response.status === 401 || response.status === 403) {
            console.warn("🚨 Unauthorized! Logging out user.");
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`🚨 HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📌 Upcoming Reviews Data:", data);

        // ✅ TODO: Update the UI to display upcoming reviews
    } catch (error) {
        console.error("❌ Error loading upcoming reviews:", error);
        alert("⚠️ Failed to load upcoming reviews. Please try again.");
    }
}

async function loadBlackouts() {
    console.log("🟢 Loading blackouts...");
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("🔴 No token found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    try {
        console.log("🟢 Making request to /api/blackout...");
        const response = await fetch("http://localhost:8080/api/blackout", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`🔹 Response status for blackouts: ${response.status}`);

        if (response.status === 401 || response.status === 403) {
            console.warn("🚨 Unauthorized! Logging out user.");
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok) {
            throw new Error(`🚨 HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Blackout Schedules:", data);

        // ✅ TODO: Update the UI to display blackouts
    } catch (error) {
        console.error("❌ Error loading blackouts:", error);
        alert("⚠️ Failed to load blackout schedules. Please try again.");
    }
}