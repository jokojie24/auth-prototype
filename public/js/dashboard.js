const method = localStorage.getItem("loginMethod");

const badge = document.getElementById("loginBadge");

if (method === "password") {
  badge.innerHTML = `<span class="badge badge-password">Logged in using Password</span>`;
}
else if (method === "otp") {
  badge.innerHTML = `<span class="badge badge-mfa">Logged in using OTP</span>`;
}
else if (method === "passkey") {
  badge.innerHTML = `<span class="badge badge-passkey">Logged in using Passkey</span>`;
}
else {
  badge.innerHTML = `<span class="badge">Login method unknown</span>`;
}
