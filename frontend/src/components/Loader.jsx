import React from "react";

export default function Loader({ text = "Loading..." }) {
  return (
    <div style={{ padding: 20, textAlign: "center" }}>
      <div>{text}</div>
    </div>
  );
}
