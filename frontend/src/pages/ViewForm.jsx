// src/pages/ViewForm.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import { Link, useParams } from "react-router-dom";

export default function ViewForm() {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    API.get(`/forms/${formId}`)
      .then((res) => setForm(res.data.form))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [formId]);

  if (loading) return <Loader />;
  if (!form) return <div style={{ padding: 20 }}>Form not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>{form.name}</h2>
      <div>
        <strong>Base:</strong> {form.airtableBaseId} <br />
        <strong>Table:</strong> {form.airtableTableId}
      </div>

      <h3 style={{ marginTop: 12 }}>Questions</h3>
      <ul>
        {form.questions.map((q) => (
          <li key={q.questionKey}>
            <strong>{q.label}</strong> ({q.type}) {q.required ? <em>required</em> : ""}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <Link to={`/form/${formId}/fill`}><button>Fill Form</button></Link>{" "}
        <Link to={`/forms/${formId}/responses`}><button>View Responses</button></Link>
      </div>
    </div>
  );
}
