import React, { useState, useEffect } from "react";
import axios from "axios";

const DogGallery = () => {
  const [galleryImages, setGalleryImages] = useState([]); // For my gallery

  const fetchGallery = async () => {
    try {
      const response = await axios.get("https://doggy-delights-backend.vercel.app/api/gallery"); // Adjusted to match your backend
      console.log("Fetched images:", response.data.images);
      setGalleryImages(response.data.images || []); // Setting my gallery images, default to empty array if nothing comes back
    } catch (error) {
      console.error("Error fetching gallery:", error); // If something goes wrong, I wanna know!
    }
  };

  // Everytime there's a change it updates using useffect
  useEffect(() => {
    fetchGallery(); // Fetch my gallery when the component loads
    const interval = setInterval(fetchGallery, 5000); // Keep checking every 5 seconds for new pups
    return () => clearInterval(interval); // Clean up when I leave the page
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-200 via-green-200 to-yellow-200 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-center text-blue-700 mb-6 sm:mb-8 md:mb-10 animate-pulse">
        Doggy Hall of Fame 🐾
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {galleryImages.length > 0 ? (
          galleryImages.map((img) => (
            <div
              key={img.id} // Unique key for each pup
              className="relative bg-white rounded-xl shadow-xl p-3 sm:p-4 transform transition-all hover:scale-105 hover:shadow-2xl animate-bark"
            >
              <img
                src={img.imageUrl}
                alt={img.name} // Show my pup’s name if it fails to load
                className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-lg"
              />
              <div className="absolute top-1 sm:top-2 right-1 sm:right-2 bg-yellow-500 text-white text-xs sm:text-sm font-bold px-2 sm:px-3 py-1 rounded-full shadow-md">
                {img.name} // Displaying my pup’s cool name
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 text-sm sm:text-base md:text-lg">
            No images yet. Upload some adorable doggos! 🐶 // Let’s encourage some uploads!
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
          animation: bark 0.3s ease-in-out; // Bark animation for my pups!
        }
      `}</style>
    </div>
  );
};

export default DogGallery;