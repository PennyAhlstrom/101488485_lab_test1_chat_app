const signupForm = document.getElementById("signupForm");
const alertBox = document.getElementById("alertBox");

function showAlert(message, type = "danger") {
  alertBox.className = `alert alert-${type}`;
  alertBox.textContent = message;
  alertBox.classList.remove("d-none");
}

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const firstname = document.getElementById("firstname").value.trim();
  const lastname = document.getElementById("lastname").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, firstname, lastname, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      showAlert(data.message || "Signup failed.");
      return;
    }

    showAlert("Signup successful! Redirecting to login...", "success");

    setTimeout(() => {
      window.location.href = "/login";
    }, 1200);

  } catch (err) {
    showAlert("Server error. Please try again.");
  }
});
