// src/pages/CreateForm.jsx
import React, { useEffect, useState } from "react";
import API from "../api/axios.js";
import Loader from "../components/Loader.jsx";
import FieldSelector from "../components/FieldSelector.jsx";
import ConditionalEditor from "../components/ConditionalEditor.jsx";
import { useNavigate } from "react-router-dom";

export default function CreateForm() {
  const navigate = useNavigate();
  const airtableUserId = localStorage.getItem("airtableUserId");

  const [bases, setBases] = useState([]);
  const [tables, setTables] = useState([]);
  const [fields, setFields] = useState([]);
  const [selectedBase, setSelectedBase] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState({}); 
  const [formName, setFormName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!airtableUserId) {
      alert("Please login first");
      navigate("/login");
      return;
    }
    setLoading(true);
    API.get("/forms/airtable/bases", { params: { userId: airtableUserId } })
      .then((res) => setBases(res.data.bases || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [airtableUserId, navigate]);

  useEffect(() => {
    if (!selectedBase) return;
    setLoading(true);
    API.get("/forms/airtable/tables", { params: { userId: airtableUserId, baseId: selectedBase } })
      .then((res) => setTables(res.data.tables || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [selectedBase, airtableUserId]);

  useEffect(() => {
    if (!selectedBase || !selectedTable) return;
    setLoading(true);
    API.get("/forms/airtable/fields", { params: { userId: airtableUserId, baseId: selectedBase, tableId: selectedTable } })
      .then((res) => setFields(res.data.fields || []))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [selectedBase, selectedTable, airtableUserId]);

  const onFieldChange = (fieldId, cfg) => {
    setSelectedQuestions((s) => {
      const clone = { ...s };
      if (!cfg) {
        delete clone[fieldId];
      } else clone[fieldId] = cfg;
      return clone;
    });
  };

  const saveForm = async () => {
    if (!formName) return alert("Form name required");
    const questions = Object.values(selectedQuestions);
    if (questions.length === 0) return alert("Select at least one field");
    try {
      setLoading(true);
      const payload = {
        owner: airtableUserId,
        name: formName,
        airtableBaseId: selectedBase,
        airtableTableId: selectedTable,
        questions,
      };
      const resp = await API.post("/forms", payload);
      alert("Form created");
      const formId = resp.data.form._id || resp.data.form.id;
      navigate(`/form/${formId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save form");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div style={{ padding: 20 }}>
      <h2>Create Form</h2>
      <div style={{ marginBottom: 12 }}>
        <label>Form name: <input value={formName} onChange={(e) => setFormName(e.target.value)} /></label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Select Base:
          <select value={selectedBase} onChange={(e) => setSelectedBase(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">--select--</option>
            {bases.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label>
          Select Table:
          <select value={selectedTable} onChange={(e) => setSelectedTable(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">--select--</option>
            {tables.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </label>
      </div>

      <FieldSelector fields={fields} selected={selectedQuestions} onChange={onFieldChange} />

      <div style={{ marginTop: 12 }}>
        <h3>Conditional Rules (per question)</h3>
        {Object.values(selectedQuestions).length === 0 && <div>Select a field above to configure rules.</div>}
        {Object.values(selectedQuestions).map((q) => (
          <div key={q.questionKey} style={{ border: "1px solid #eee", padding: 10, marginBottom: 8 }}>
            <div style={{ marginBottom: 8 }}><strong>{q.label}</strong></div>
            <ConditionalEditor
              questions={Object.values(selectedQuestions).map((x) => ({ questionKey: x.questionKey, label: x.label }))}
              value={q.conditionalRules}
              onChange={(val) => onFieldChange(q.airtableFieldId, { ...q, conditionalRules: val })}
            />
          </div>
        ))}
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={saveForm}>Save Form</button>
      </div>
    </div>
  );
}
