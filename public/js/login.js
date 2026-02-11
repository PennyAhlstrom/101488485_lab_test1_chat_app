const loginForm = document.getElementById("loginForm");
const alertBox = document.getElementById("alertBox");

function showAlert(message, type = "danger") {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || "Login failed.");
      return;
    }

    // Save user session
    localStorage.setItem("user", JSON.stringify(data.user));

    showAlert("Login successful! Redirecting...", "success");

    setTimeout(() => {
      window.location.href = "/rooms";
    }, 1000);

  } catch (err) {
    showAlert("Server error. Please try again.");
  }
});
