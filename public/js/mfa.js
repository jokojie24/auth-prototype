async function startMFA() {
  const res = await fetch("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      password: password.value,
    }),
  });

  if (!res.ok) {
    alert("Password incorrect");
    return;
  }

  await fetch("/auth/mfa/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.value }),
  });

  const otp = prompt("Enter OTP (check server console)");
  verifyOTP(otp);
}

async function verifyOTP(otp) {
  const res = await fetch("/auth/mfa/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: email.value,
      otp: otp,
    }),
  });

  if (res.ok) {
    // ✅ FRONTEND-ONLY: store login method
    localStorage.setItem("loginMethod", "otp");

    // Redirect to dashboard
    window.location.href = "dashboard.html";
  } else {
    alert("OTP verification failed");
  }
}
