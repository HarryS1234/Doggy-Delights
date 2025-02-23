import React, { useState } from "react";
import axios from "axios";

const DogImages = () => {
  const [file, setFile] = useState(null); // File state for uploaded/generated image
  const [status, setStatus] = useState("Idle"); // Default to "Idle"
  const [uploadProgress, setUploadProgress] = useState(0); // Progress of upload
  const [randomImages, setRandomImages] = useState([]); // Array for the random Images
  const [imageUrl, setImageUrl] = useState(null); // URL for previewing the latest image

  // Handle file selection from the user's computer
  const handleFileChange = (e) => {
    if (e.target.files) {
      // This makes sure the files array is not empty and only set the setFile then
      setFile(e.target.files[0]);
    }
  };

  // Fetch a random dog image and convert it to a file
  const fetchDogImage = async () => {
    try {
      const response = await axios.get("https://dog.ceo/api/breeds/image/random");
      const imageUrl = response.data.message; // Get the URL of the random dog image

      // Fetch the image as a blob
      const fetchUrl = await fetch(imageUrl); // cuz I Need the raw data object to upload it including my headers
      const blob = await fetchUrl.blob(); // blob is binary large object good for images

      // Convert the blob to a File object
      const dogFile = new File([blob], "DogImage.jpg", {
        type: "image/jpeg",
      });

      // here i am creating a file object from the blob and random naming with metadata type and it tells browsers and servers what kind of data the file contains
      console.log(dogFile);

      // Update state with the new file and image URL
      setFile(dogFile);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error fetching random image:", error);
    }
  };

  // Handle file upload to the backend
  const handleFileUpload = async () => {
    if (!file) {
      alert("No file selected!");
      return;
    }

    setStatus("Uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file); // I am creating a key which takes file as a value

    try {
      const response = await axios.post(
        "https://doggy-delights-backend.vercel.app/api/upload", // Adjusted to match your backend
        formData,
        {
          headers: {
            // Headers our key contiaining an object
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            // That's a method in axios
            const progress = progressEvent.total // file size
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            // I have used conditonal rendering if the file size is available then then showing how much has been done otherwise 0.
            setUploadProgress(progress);
          },
        }
      );

      setStatus("Success");
      setUploadProgress(100);

      // Update the list of uploaded images
      const { name, imageUrl: uploadedUrl } = response.data;
      setRandomImages([...randomImages, { id: Date.now(), imageUrl: uploadedUrl, name }]);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Error");
      setUploadProgress(0);
    }
  };

  // Delete all images from Cloudinary
  const handleDeleteAll = async () => {
    try {
      const response = await axios.delete("https://doggy-delights-backend.vercel.app/api/delete-all");
      alert(response.data.message);
      setRandomImages([]); // Clear local images
      setImageUrl(null); // Reset preview
      setFile(null); // Reset file
      setStatus("Idle"); // Reset status
    } catch (error) {
      console.error("Error deleting images:", error);
      alert("Failed to delete images");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex flex-col items-center p-4 sm:p-6 md:p-8 bg-[url('https://www.transparenttextures.com/patterns/paws.png')] bg-opacity-50">
      {/* Header */}
      <header className="text-center mb-6 sm:mb-8 md:mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold drop-shadow-lg animate-bounce">
          Welcome to Doggy Delights! 🐶
        </h1>
        <p className="text-base sm:text-lg md:text-xl font-semibold mt-2 sm:mt-3 md:mt-4 max-w-md sm:max-w-lg md:max-w-2xl mx-auto drop-shadow-md">
          Calling all dog lovers! Share your favorite pup pics or fetch a random adorable doggo with just one click. Dive into our Gallery for a pawsome time filled with tail wags and cuteness overload!
        </p>
      </header>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 w-full max-w-xs sm:max-w-md md:max-w-lg transform transition-all hover:scale-105">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-purple-600 mb-4 sm:mb-6">
          Woof Woof Uploads!
        </h2>

        {/* File Upload */}
        <div className="mb-4 sm:mb-6">
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-2 sm:py-3 md:py-4 px-4 sm:px-6 text-sm sm:text-base md:text-lg inline-block text-center shadow-md transform hover:scale-110"
          >
            Pick a Pup Pic 🐾
          </label>
        </div>

        {/* Random Image Generator */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={fetchDogImage}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-2 sm:py-3 md:py-4 px-4 sm:px-6 text-sm sm:text-base md:text-lg inline-block text-center shadow-md transform hover:scale-110 animate-wiggle"
          >
            Fetch a Random Good Boy!
          </button>
        </div>

        {/* Delete All Button */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-2 sm:py-3 md:py-4 px-4 sm:px-6 text-sm sm:text-base md:text-lg inline-block text-center shadow-md transform hover:scale-110"
          >
            Clear Gallery 🗑️
          </button>
        </div>

        {/* Preview Image and Upload Button */}
        {imageUrl && (
          <div className="mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-purple-700 mb-2">Latest Pup:</h3>
            <img
              src={imageUrl}
              alt="Random Dog"
              className="w-full max-h-64 object-cover rounded-xl shadow-lg transform transition-all hover:rotate-3"
            />
            {/* Upload Button Below Image */}
            {file && status !== "Uploading" && (
              <button
                onClick={handleFileUpload}
                className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold w-full rounded-full py-2 sm:py-3 md:py-4 px-4 sm:px-6 text-sm sm:text-base md:text-lg transition-all duration-300 shadow-md transform hover:scale-110"
              >
                Upload to Doggy Heaven!
              </button>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {status === "Uploading" && (
          <div className="mt-4">
            <p className="text-base sm:text-lg text-purple-700 mb-2">
              Uploading: {uploadProgress}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-purple-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Status Messages */}
        {status === "Success" && (
          <div className="mt-4 p-3 sm:p-4 bg-green-100 text-green-800 rounded-xl flex items-center text-sm sm:text-base">
            <span className="text-xl sm:text-2xl mr-2">🐶</span> Uploaded to the Pack!
          </div>
        )}
        {status === "Error" && (
          <div className="mt-4 p-3 sm:p-4 bg-red-100 text-red-800 rounded-xl flex items-center text-sm sm:text-base">
            <span className="text-xl sm:text-2xl mr-2">😿</span> Oops, Pup Got Lost!
          </div>
        )}
      </div>

      {/* Custom Tailwind Animation */}
      <style>{`
        @keyframes wiggle {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-5deg); }
          100% { transform: rotate(0deg); }
        }
        .animate-wiggle {
          animation: wiggle 0.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default DogImages;