import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home/Home";
import SignIn from "./pages/Login/Login";
import Navbar from "./Components/Navbar";
import Signup from "./pages/Signup/Signup";
import { Toaster } from "react-hot-toast";
import DashboardHome from "./pages/DashboardPage/DashboardHome";

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
          <Route path="/dashboard/*" exact element={<DashboardHome />} />

      </Routes>
    </Router>
    </>
  );
}

export default App;
