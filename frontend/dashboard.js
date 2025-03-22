document.addEventListener("DOMContentLoaded", () => {
    //  Removed redundant token check and redirect from here.
    //  Authentication is now handled *exclusively* by auth.js.

    // Logout button event listener (This is correct and stays here)
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("jwtToken");
            window.location.href = "login.html";
        });
    }
    // Load data when the DOM is ready
    loadUpcomingReviews();
    loadBlackouts();

    // Blackout form submission event listener
    const blackoutForm = document.getElementById("blackout-form");
    if (blackoutForm) {
        blackoutForm.addEventListener("submit", async (event) => {
            event.preventDefault(); // Prevent default form submission

            const blackoutName = document.getElementById("blackout-name").value;
            const blackoutStart = document.getElementById("blackout-start").value;
            const blackoutEnd = document.getElementById("blackout-end").value;
            const blackoutUser = document.getElementById("blackout-user").value;

            const token = localStorage.getItem("jwtToken");
            // No need to check for token here, auth.js handles it

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

                if (response.status === 401 || response.status === 403) {
                    //  No need to redirect here, auth.js handles it globally
                    alert("Unauthorized. Please log in again.");
                    return;
                }

                if (!response.ok) {
                    const errorData = await response.json(); // Attempt to get error details
                    throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorData.message || 'Unknown error'}`);
                }

                // Refresh blackout list after successful submission
                loadBlackouts();
                blackoutForm.reset(); // Clear the form
            } catch (error) {
                console.error("Error adding blackout:", error);
                alert(`Failed to add blackout: ${error.message}`);
            }
        });
    }



    async function loadUpcomingReviews() {
        console.log("🟢 Loading upcoming reviews...");
        const token = localStorage.getItem("jwtToken");

        // Removed redundant token check

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
                // No need to redirect or remove token, auth.js handles it
                console.warn("🚨 Unauthorized!");
                return; //  Just return; auth.js will handle the redirect
            }

            if (!response.ok) {
                throw new Error(`🚨 HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("📌 Upcoming Reviews Data:", data);

            // Update the UI with upcoming reviews
            const reviewsDiv = document.getElementById("upcoming-reviews");
            reviewsDiv.innerHTML = ""; // Clear previous content

            if (data.length === 0) {
                reviewsDiv.innerHTML = "<p>No upcoming reviews.</p>";
            } else {
                const ul = document.createElement("ul");
                data.forEach(review => {
                    const li = document.createElement("li");
                    // Assuming your API returns review data in a useful format, adjust this as needed
                    li.textContent = `Review for ${review.noteTitle} on ${new Date(review.reviewDate).toLocaleString()}`; // Example
                    ul.appendChild(li);
                });
                reviewsDiv.appendChild(ul);
            }

        } catch (error) {
            console.error("❌ Error loading upcoming reviews:", error);
            alert(`⚠️ Failed to load upcoming reviews. Please try again. ${error.message}`);
        }
    }

    async function loadBlackouts() {
        console.log("🟢 Loading blackouts...");
        const token = localStorage.getItem("jwtToken");

        // Removed redundant token check

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
                // No need to redirect here, auth.js does it globally
                console.warn("🚨 Unauthorized!");
                return;  // Just return; auth.js handles the redirect.
            }

            if (!response.ok) {
                throw new Error(`🚨 HTTP Error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Blackout Schedules:", data);

            // Update the UI to display blackouts
            const blackoutList = document.getElementById("blackout-list");
            blackoutList.innerHTML = ""; // Clear existing list

            if (data.length === 0) {
                blackoutList.innerHTML = "<li>No blackout windows scheduled.</li>";
            } else {
                data.forEach(blackout => {
                    const li = document.createElement("li");
                    li.textContent = `${blackout.name} - Start: ${new Date(blackout.start).toLocaleString()}, End: ${new Date(blackout.end).toLocaleString()}, Applied by: ${blackout.user}`;
                    blackoutList.appendChild(li);
                });
            }
        } catch (error) {
            console.error("❌ Error loading blackouts:", error);
            alert(`⚠️ Failed to load blackout schedules. Please try again. ${error.message}`);
        }
    }


});