import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import SignIn from "./pages/Login/Login";
import Navbar from "./Components/Navbar";
import Signup from "./pages/Signup/Signup";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
          <Toaster />
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </Router>
    </>
  );
}

export default App;
