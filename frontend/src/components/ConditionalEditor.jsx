
import React from "react";

export default function ConditionalEditor({ questions = [], value = null, onChange }) {
  const addCondition = () => {
    const c = { questionKey: questions[0]?.questionKey || "", operator: "equals", value: "" };
    onChange({ logic: value?.logic || "AND", conditions: [...(value?.conditions || []), c] });
  };

  const updateCondition = (idx, patch) => {
    const conds = (value?.conditions || []).map((c, i) => (i === idx ? { ...c, ...patch } : c));
    onChange({ logic: value?.logic || "AND", conditions: conds });
  };

  const removeCondition = (idx) => {
    const conds = (value?.conditions || []).filter((_, i) => i !== idx);
    onChange({ logic: value?.logic || "AND", conditions: conds });
  };

  return (
    <div style={{ border: "1px dashed #ccc", padding: 8 }}>
      <div style={{ marginBottom: 8 }}>
        <label>
          Logic:
          <select
            value={value?.logic || "AND"}
            onChange={(e) => onChange({ ...(value || {}), logic: e.target.value })}
            style={{ marginLeft: 8 }}
          >
            <option value="AND">AND</option>
            <option value="OR">OR</option>
          </select>
        </label>
      </div>

      {(value?.conditions || []).map((c, idx) => (
        <div key={idx} style={{ marginBottom: 6, display: "flex", gap: 8, alignItems: "center" }}>
          <select
            value={c.questionKey}
            onChange={(e) => updateCondition(idx, { questionKey: e.target.value })}
          >
            {questions.map((q) => (
              <option key={q.questionKey} value={q.questionKey}>
                {q.label || q.questionKey}
              </option>
            ))}
          </select>

          <select value={c.operator} onChange={(e) => updateCondition(idx, { operator: e.target.value })}>
            <option value="equals">equals</option>
            <option value="notEquals">notEquals</option>
            <option value="contains">contains</option>
          </select>

          <input
            value={c.value}
            onChange={(e) => updateCondition(idx, { value: e.target.value })}
            placeholder="value"
          />

          <button onClick={() => removeCondition(idx)}>Remove</button>
        </div>
      ))}

      <div>
        <button onClick={addCondition}>Add condition</button>
      </div>
    </div>
  );
}
