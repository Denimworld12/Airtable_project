import React, { useEffect, useState } from "react";
import API from "../api/axios.js";
import { useNavigate, useLocation } from "react-router-dom";
import Loader from "../components/Loader.jsx";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const generateState = () => {
    return [...crypto.getRandomValues(new Uint8Array(16))]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  };


  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const code = q.get("code");
    const returnedState = q.get("state");

    if (code) {
      const storedState = localStorage.getItem("oauth_state");
      if (!returnedState || returnedState !== storedState) {
        console.error("State mismatch", returnedState, storedState);
        alert("State parameter invalid. Login again.");
        return;
      }

      setLoading(true);

      API.post("/auth/airtable/callback", {
        code,
        state: returnedState,
      })
        .then((res) => {
          const airtableUser = res.data.user;

          if (airtableUser?.id) {
            localStorage.setItem("airtableUserId", airtableUser.id);
          }

          if (res.data.accessToken) {
            localStorage.setItem("airtableAccessToken", res.data.accessToken);
          }

          navigate("/create");
        })
        .catch((err) => {
          console.error(err);
          alert("OAuth exchange failed");
        })
        .finally(() => setLoading(false));
    }
  }, [location.search, navigate]);

const startOAuth = async () => {
  try {
    // generate random state
    const state = crypto.randomUUID();
    localStorage.setItem("oauth_state", state);

    const resp = await API.get("/auth/airtable/url", { params: { state } });

    window.location.href = resp.data.url;
  } catch (err) {
    console.error(err);
    alert("Failed to fetch auth URL");
  }
};


  if (loading) return <Loader text="Completing OAuth..." />;

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <p>
        Click to sign in with Airtable. You will be redirected back after authorizing.
      </p>
      <button onClick={startOAuth}>Login with Airtable</button>
    </div>
  );
}
