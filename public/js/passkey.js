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

  // Ask server for registration options
  const response = await fetch("/webauthn/register/begin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const options = await response.json();


  console.log("BEGIN REGISTRATION RESPONSE:", options);

  // Validate server response
  if (options.error) {
    alert(options.error);
    return;
  }

  if (!options || !options.challenge) {
    alert("Invalid registration options. Check console and server logs.");
    return;
  }

  const attResp = await startRegistration(options);


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

  // Ask server for authentication options
  const response = await fetch("/webauthn/login/begin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const options = await response.json();


  console.log("BEGIN LOGIN RESPONSE:", options);

  // Validate login options
  if (options.error) {
    alert(options.error);
    return;
  }

  if (!options || !options.challenge) {
    alert("Invalid login options. Check console and server logs.");
    return;
  }

  // Authenticate using passkey (v13+ correct call)
  const authResp = await startAuthentication({
    optionsJSON: options,
  });

  // Verify authentication on server (WITH USER CONTEXT)
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

  localStorage.setItem("loginMethod", "passkey");


  window.location.href = "dashboard.html";
}
