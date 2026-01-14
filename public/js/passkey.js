import {
  startRegistration,
  startAuthentication,
} from "https://cdn.jsdelivr.net/npm/@simplewebauthn/browser/+esm";

/* =========================================================
   PASSKEY REGISTRATION
========================================================= */
export async function passkeyRegister() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Email is required");
    return;
  }

  // Step 1: Ask server for registration options
  const response = await fetch("/webauthn/register/begin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const options = await response.json();

  // 🔴 DEBUG LOG (KEEP THIS)
  console.log("BEGIN REGISTRATION RESPONSE:", options);

  // Step 2: Validate server response
  if (options.error) {
    alert(options.error);
    return;
  }

  if (!options || !options.challenge) {
    alert("Invalid registration options. Check console and server logs.");
    return;
  }

  // Step 3: Create passkey via browser / OS
  const attResp = await startRegistration(options);

  // Step 4: Send credential back to server for verification
  const finishResponse = await fetch("/webauthn/register/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      credential: attResp,
    }),
  });

  const finishResult = await finishResponse.json();

  if (finishResult.error) {
    alert(finishResult.error);
    return;
  }

  alert("Passkey registered successfully");
}

/* =========================================================
   PASSKEY LOGIN
========================================================= */
export async function passkeyLogin() {
  const email = document.getElementById("email").value;

  if (!email) {
    alert("Email is required for passkey login");
    return;
  }

  // Step 1: Ask server for authentication options (WITH USER CONTEXT)
  const response = await fetch("/webauthn/login/begin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const options = await response.json();

  // 🔴 DEBUG LOG (KEEP THIS)
  console.log("BEGIN LOGIN RESPONSE:", options);

  // Step 2: Validate login options
  if (options.error) {
    alert(options.error);
    return;
  }

  if (!options || !options.challenge) {
    alert("Invalid login options. Check console and server logs.");
    return;
  }

  // Step 3: Authenticate using passkey (v13+ correct call)
  const authResp = await startAuthentication({
    optionsJSON: options,
  });

  // Step 4: Verify authentication on server (WITH USER CONTEXT)
  const finishResponse = await fetch("/webauthn/login/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      credential: authResp,
    }),
  });

  const finishResult = await finishResponse.json();

  if (finishResult.error) {
    alert(finishResult.error);
    return;
  }

  // ✅ FRONTEND-ONLY: store login method
  localStorage.setItem("loginMethod", "passkey");

  // Redirect to dashboard
  window.location.href = "dashboard.html";
}
