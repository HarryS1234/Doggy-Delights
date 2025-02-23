import React from "react";
import { BrowserRouter as Router, Route, Link, Routes } from "react-router-dom";
import DogImages from "./components/DogImages";
import DogGallery from "./components/DogGallery";


const App = () => {
  return (
    <Router>
      {/* Navbar */}
      <nav className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 flex justify-center space-x-12 shadow-lg">
        <Link
          to="/"
          className="text-white font-extrabold text-2xl hover:text-yellow-300 transition-all duration-300 flex items-center"
        >
          <span className="mr-2">🏠</span> Homepage
        </Link>
        <Link
          to="/gallery"
          className="text-white font-extrabold text-2xl hover:text-yellow-300 transition-all duration-300 flex items-center"
        >
          <span className="mr-2">🐶</span> Our Gallery
        </Link>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<DogImages/>} />
        <Route path="/gallery" element={<DogGallery/>} />
      </Routes>
    </Router>
  );
};

export default App;