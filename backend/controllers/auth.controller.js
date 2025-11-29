import axios from "axios";
import AirtableUser from "../models/User.model.js";
import crypto from "crypto";

const AIRTABLE_TOKEN_URL = "https://airtable.com/oauth2/v1/token";
const AIRTABLE_ME_URL = "https://api.airtable.com/v0/meta/me";


function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("hex");
}

function generateCodeChallenge(verifier) {
  return crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
}

function base64URLEncode(str) {
  return str.toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function sha256(buffer) {
  return crypto.createHash("sha256").update(buffer).digest();
}
export const getAirtableAuthUrl = async (req, res) => {
  try {
    const state = crypto.randomUUID();

    const codeVerifier = generateCodeVerifier(64);
    const codeChallenge = generateCodeChallenge(codeVerifier);

    const params = new URLSearchParams({
      client_id: process.env.AIRTABLE_CLIENT_ID,
      redirect_uri: process.env.AIRTABLE_REDIRECT_URI,
      response_type: "code",
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      scope: "data.records:read data.records:write data.bases:read",
    });

    const url = `https://airtable.com/oauth2/v1/authorize?${params.toString()}`;


    return res.json({ url });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to generate auth URL" });
  }
};



export const airtableCallback = async (req, res) => {
  const { code, state } = req.query;

  if (!code) return res.status(400).json({ message: "Code missing" });
  if (state !== req.session.state)
    return res.status(400).json({ message: "Invalid state" });

  try {
    const code_verifier = req.session.code_verifier;

    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("client_id", process.env.AIRTABLE_CLIENT_ID);
    params.append("code_verifier", code_verifier);
    params.append("redirect_uri", process.env.AIRTABLE_REDIRECT_URI);

    const tokenResp = await axios.post(AIRTABLE_TOKEN_URL, params.toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const { access_token, refresh_token, expires_in } = tokenResp.data;

    const me = await axios.get(AIRTABLE_ME_URL, {
      headers: { Authorization: `Bearer ${access_token}` },
    });


    const userId = me.data.accountId || me.data.user?.id;
    const name = me.data.user?.name;
    const email = me.data.user?.email;

    // Upsert
    let user = await AirtableUser.findOne({ userId });
    if (!user) {
      user = new AirtableUser({
        userId,
        name,
        email,
        accessToken: access_token,
        refreshToken: refresh_token,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        loginAt: new Date(),
      });
    } else {
      user.accessToken = access_token;
      user.refreshToken = refresh_token;
      user.expiresAt = new Date(Date.now() + expires_in * 1000);
      user.loginAt = new Date();
    }

    await user.save();

    return res.json({ user: me.data });
  } catch (error) {
    console.error("OAuth Callback Error: ", error.response?.data || error);
    return res.status(500).json({ message: error.response?.data || error.message });
  }
};
