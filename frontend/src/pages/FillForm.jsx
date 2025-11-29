// src/pages/FillForm.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios.js";
import Loader from "../components/Loader.jsx";

/**
 * Local copy of shouldShowQuestion function so conditional logic works client-side.
 */
function shouldShowQuestion(rules, answersSoFar) {
  if (!rules) return true;
  const { logic = "AND", conditions = [] } = rules;
  function evalCondition(cond) {
    const { questionKey, operator, value } = cond;
    const answer = answersSoFar ? answersSoFar[questionKey] : undefined;
    const safeToString = (v) => (v === null || v === undefined ? "" : String(v));
    try {
      switch (operator) {
        case "equals":
          return safeToString(answer) === safeToString(value);
        case "notEquals":
          return safeToString(answer) !== safeToString(value);
        case "contains":
          if (Array.isArray(answer)) return answer.includes(value);
          return safeToString(answer).includes(safeToString(value));
        default:
          return false;
      }
    } catch (e) {
      return false;
    }
  }
  const results = conditions.map(evalCondition);
  if (logic === "AND") return results.every(Boolean);
  return results.some(Boolean);
}

export default function FillForm() {
  const { formId } = useParams();
  const airtableUserId = localStorage.getItem("airtableUserId");
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!formId) return;
    setLoading(true);
    API.get(`/forms/${formId}`)
      .then((res) => {
        setForm(res.data.form);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [formId]);

  const onChange = (k, v) => setAnswers((s) => ({ ...s, [k]: v }));

  const onSubmit = async () => {
    // validate required fields visible
    for (const q of form.questions) {
      const visible = shouldShowQuestion(q.conditionalRules, answers);
      if (!visible) continue;
      if (q.required) {
        const val = answers[q.questionKey];
        if (val === undefined || val === null || val === "") {
          return alert(`Required: ${q.label}`);
        }
      }
      if (q.type === "single_select" && answers[q.questionKey] && !q.options.includes(answers[q.questionKey])) {
        return alert(`Invalid option for ${q.label}`);
      }
      if (q.type === "multi_select" && answers[q.questionKey]) {
        if (!Array.isArray(answers[q.questionKey])) return alert(`Invalid multi-select for ${q.label}`);
        for (const v of answers[q.questionKey]) if (!q.options.includes(v)) return alert(`Invalid option in ${q.label}`);
      }
    }

    try {
      setLoading(true);
      const payload = { answers, airtableUserId };
      const resp = await API.post(`/forms/${formId}/submit`, payload);
      alert("Response saved");
      navigate(`/forms/${formId}/responses`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!form) return <div style={{ padding: 20 }}>Form not found</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Fill {form.name}</h2>
      <div>
        {form.questions.map((q) => {
          const visible = shouldShowQuestion(q.conditionalRules, answers);
          if (!visible) return null;
          const key = q.questionKey;
          if (q.type === "short_text" || q.type === "long_text") {
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <label>
                  {q.label} {q.required && "*"}
                  <div>
                    {q.type === "short_text" ? (
                      <input value={answers[key] || ""} onChange={(e) => onChange(key, e.target.value)} />
                    ) : (
                      <textarea value={answers[key] || ""} onChange={(e) => onChange(key, e.target.value)} />
                    )}
                  </div>
                </label>
              </div>
            );
          }
          if (q.type === "single_select") {
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <label>
                  {q.label} {q.required && "*"}
                  <div>
                    <select value={answers[key] || ""} onChange={(e) => onChange(key, e.target.value)}>
                      <option value="">--select--</option>
                      {q.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </label>
              </div>
            );
          }
          if (q.type === "multi_select") {
            const arr = Array.isArray(answers[key]) ? answers[key] : [];
            const toggle = (val) => {
              const next = arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
              onChange(key, next);
            };
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <div>{q.label} {q.required && "*"}</div>
                {q.options.map((opt) => (
                  <label key={opt} style={{ display: "block" }}>
                    <input type="checkbox" checked={arr.includes(opt)} onChange={() => toggle(opt)} /> {opt}
                  </label>
                ))}
              </div>
            );
          }
          if (q.type === "attachment") {
            return (
              <div key={key} style={{ marginBottom: 12 }}>
                <label>
                  {q.label} {q.required && "*"}
                  <div>
                    <input
                      placeholder="Provide public URL to file"
                      value={answers[key] || ""}
                      onChange={(e) => onChange(key, e.target.value)}
                    />
                    <div style={{ fontSize: 12, color: "#666" }}>
                      Note: Provide a public URL (Airtable will fetch this to attach). Uploading files is not implemented here.
                    </div>
                  </div>
                </label>
              </div>
            );
          }
          return null;
        })}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={onSubmit}>Submit</button>
      </div>
    </div>
  );
}
