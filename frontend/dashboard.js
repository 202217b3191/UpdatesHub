// ✅ Function to load upcoming reviews
async function loadUpcomingReviews() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("❌ No token found! Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    console.log("🟢 Token found:", token);

    try {
        const response = await fetch("http://localhost:8080/api/upcoming-reviews", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`🔹 Response status for upcoming reviews: ${response.status}`);

        if (response.status === 403) {
            console.warn("🚨 Access forbidden! Logging out user.");
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
            return;
        }

        const data = await response.json();
        console.log("📌 Upcoming Reviews Data:", data);

        // ✅ TODO: Update the UI to display upcoming reviews
    } catch (error) {
        console.error("❌ Error loading upcoming reviews:", error);
    }
}

// ✅ Function to load blackout schedules
async function loadBlackouts() {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.error("🔴 No token found. Redirecting to login...");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch("http://localhost:8080/api/blackout", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        console.log(`🔹 Response status for blackouts: ${response.status}`);

        if (response.status === 403) {
            console.warn("🚨 Access forbidden! Logging out user.");
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
    }
}

// ✅ Load data when the dashboard opens
document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        console.warn("⚠️ No JWT token found. Redirecting to login...");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000); // Delay to avoid instant redirection
        return;
    }

    console.log("🟢 Token found:", token);
    loadUpcomingReviews();
    loadBlackouts();
});

