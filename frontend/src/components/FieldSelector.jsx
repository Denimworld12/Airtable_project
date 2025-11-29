// src/components/FieldSelector.jsx
import React from "react";

export default function FieldSelector({ fields = [], selected = {}, onChange }) {
  return (
    <div>
      <h3>Available Airtable Fields</h3>
      {fields.length === 0 && <div>No supported fields found.</div>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {fields.map((f) => {
          const cfg = selected[f.id] || null;
          return (
            <li key={f.id} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <strong>{f.name}</strong> <em>({f.type})</em>
                </div>
                <div>
                  <label style={{ marginRight: 8 }}>
                    <input
                      type="checkbox"
                      checked={!!cfg}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onChange(f.id, {
                            questionKey: f.id,
                            airtableFieldId: f.id,
                            label: f.name,
                            type: f.type,
                            required: false,
                            options: f.options || [],
                            conditionalRules: null,
                          });
                        } else {
                          onChange(f.id, null); // remove
                        }
                      }}
                    />{" "}
                    Include
                  </label>
                </div>
              </div>

              {cfg && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ marginBottom: 6 }}>
                    <label>
                      Label:{" "}
                      <input
                        value={cfg.label}
                        onChange={(e) => onChange(f.id, { ...cfg, label: e.target.value })}
                      />
                    </label>
                  </div>
                  <label style={{ marginRight: 10 }}>
                    <input
                      type="checkbox"
                      checked={!!cfg.required}
                      onChange={(e) => onChange(f.id, { ...cfg, required: e.target.checked })}
                    />{" "}
                    Required
                  </label>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
