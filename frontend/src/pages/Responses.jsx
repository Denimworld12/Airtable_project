// src/pages/Responses.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import { useParams } from "react-router-dom";

export default function Responses() {
  const { formId } = useParams();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    API.get(`/forms/${formId}/responses`)
      .then((res) => setResponses(res.data.responses || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) return <Loader />;

  return (
    <div style={{ padding: 20 }}>
      <h2>Responses</h2>
      {responses.length === 0 && <div>No responses yet.</div>}
      <ul>
        {responses.map((r) => (
          <li key={r._id} style={{ border: "1px solid #eee", padding: 10, marginBottom: 8 }}>
            <div><strong>ID:</strong> {r._id}</div>
            <div><strong>Created:</strong> {new Date(r.createdAt).toLocaleString()}</div>
            <div><strong>Status:</strong> {r.deletedInAirtable ? "deletedInAirtable" : "active"}</div>
            <div style={{ marginTop: 8 }}>
              <strong>Answers (preview):</strong>
              <pre style={{ maxHeight: 120, overflow: "auto" }}>{JSON.stringify(r.answers, null, 2)}</pre>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
