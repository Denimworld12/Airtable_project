import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../api/axios.js";
import Loader from "../components/Loader.jsx";

export default function OAuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const q = new URLSearchParams(location.search);

    const code = q.get("code");
    const error = q.get("error");
    const state = q.get("state");

    const storedState = localStorage.getItem("oauth_state");

    if (error) {
      console.error("OAuth Error:", error);
      alert("OAuth failed: " + error);
      navigate("/");
      return;
    }

    if (!code) {
      alert("No authorization code returned");
      navigate("/");
      return;
    }

    if (!state || state !== storedState) {
      alert("State mismatch! Possible security issue.");
      console.log("state:", state, "storedState:", storedState);
      navigate("/");
      return;
    }

    API.post("/auth/airtable/callback", { code, state })
      .then((res) => {
        const airtableUser = res.data.user;

        if (airtableUser?.id) {
          localStorage.setItem("airtableUserId", airtableUser.id);
        }
        if (res.data.accessToken) {
          localStorage.setItem("airtableAccessToken", res.data.accessToken);
        }

        navigate("/create-form");
      })
      .catch((err) => {
        console.error(err);
        alert("OAuth exchange failed.");
      });
  }, []);

  return <Loader text="Completing OAuth..." />;
}
