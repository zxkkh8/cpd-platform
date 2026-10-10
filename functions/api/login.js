import {
  json,
  sameOrigin,
  databaseRequest,
  hashPassword,
  createRandomToken,
  hashToken,
  setSessionCookie,
} from "../_lib/auth.js";

const MIN_ITERATIONS = 600000;
const MAX_ITERATIONS = 1000000;

export async function onRequestPost({ request, env }) {
  if (!sameOrigin(request)) {
    return json({ error: "Invalid request origin." }, 403);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Please enter your username and password." }, 400);
  }

  const username =
    typeof body.username === "string"
      ? body.username.trim().toLowerCase()
      : "";

  const password =
    typeof body.password === "string" ? body.password : "";

  if (
    !username ||
    username.length > 254 ||
    !password ||
    password.length > 1024
  ) {
    return json({ error: "Please enter a valid username and password." }, 400);
  }

  try {
    const accounts = await databaseRequest(
      env,
      `custom_login_credentials?username=eq.${encodeURIComponent(username)}&select=username,profile_id,password_hash,salt,iterations,is_enabled&limit=1`
    );

    const account = accounts?.[0];

    // Use a dummy hash for unknown usernames to reduce timing differences.
    const salt = account?.salt || "brampton-login-dummy-salt";
    const iterations =
      account &&
      Number.isInteger(account.iterations) &&
      account.iterations >= MIN_ITERATIONS &&
      account.iterations <= MAX_ITERATIONS
        ? account.iterations
        : MIN_ITERATIONS;

    const calculatedHash = await hashPassword(password, salt, iterations);

    if (
      !account ||
      account.is_enabled !== true ||
      account.password_hash !== calculatedHash
    ) {
      return json({ error: "Incorrect username or password." }, 401);
    }

    const profiles = await databaseRequest(
      env,
      `profiles?id=eq.${encodeURIComponent(account.profile_id)}&select=id,is_active&limit=1`
    );

    const profile = profiles?.[0];

    if (!profile || profile.is_active !== true) {
      return json(
        { error: "This account is inactive. Please contact an administrator." },
        403
      );
    }

    const token = await createRandomToken();
    const tokenHash = await hashToken(token);
    const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();

    await databaseRequest(env, "custom_login_sessions", {
      method: "POST",
      headers: {
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        token_hash: tokenHash,
        profile_id: profile.id,
        expires_at: expiresAt,
      }),
    });

    return json(
      { success: true, redirect: "/dashboard.html" },
      200,
      { "Set-Cookie": setSessionCookie(token) }
    );
  } catch (error) {
    console.error("Login failed:", error.message);

    return json(
      { error: "Login is temporarily unavailable. Please try again later." },
      500
    );
  }
}
