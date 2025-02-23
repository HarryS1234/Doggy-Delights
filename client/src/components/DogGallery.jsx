import React, { useState, useEffect } from "react";
import axios from "axios";

const DogGallery = () => {
  const [galleryImages, setGalleryImages] = useState([]); // For my gallery

  const fetchGallery = async () => {
    try {
      const response = await axios.get("http://localhost:3000/gallery");
      console.log("Fetched images:", response.data.images);
      setGalleryImages(response.data.images);
    } catch (error) {
      console.error("Error fetching gallery:", error);
    }
  };
  useEffect(() => {
    fetchGallery();
  }, []);

  // Everytime there's a change it updates using useffect

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-green-200 to-yellow-200 p-8">
      <h1 className="text-5xl font-extrabold text-center text-blue-700 mb-10 animate-pulse">
        Doggy Hall of Fame 🐾
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {galleryImages.length > 0 ? (
          galleryImages.map((img) => (
            <div
              key={img.id} 
              className="relative bg-white rounded-xl shadow-xl p-4 transform transition-all hover:scale-105 hover:shadow-2xl animate-bark"
            >
              <img
                src={img.imageUrl}
                alt={img.name} 
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 bg-yellow-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                {img.name} 
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No images yet. Upload some adorable doggos! 🐶
          </p>
        )}
      </div>

      {/* Custom Tailwind Animation */}
      <style>{`
        @keyframes bark {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .animate-bark:hover {
          animation: bark 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DogGallery;
