async function register() {
  await fetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });

  alert("Registered successfully");
}

async function login() {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });

  if (res.ok) {
    // ✅ FRONTEND-ONLY: store login method
    localStorage.setItem("loginMethod", "password");

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } else {
    alert("Login failed");
  }
}
