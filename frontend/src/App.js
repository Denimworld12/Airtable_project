import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import CreateForm from "./pages/CreateForm.jsx";
import ViewForm from "./pages/ViewForm.jsx";
import FillForm from "./pages/FillForm.jsx";
import Responses from "./pages/Responses.jsx";
import OAuthCallback from "./pages/OAuthCallback.jsx";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/create-form" element={<CreateForm />} />
        <Route path="/form/:formId" element={<FillForm />} />
        <Route path="/view-form/:formId" element={<ViewForm />} />
        <Route path="/responses/:formId" element={<Responses />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
