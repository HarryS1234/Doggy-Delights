import React, { useState } from "react";
import axios from "axios";

const DogImages = () => {
  const [files, setFiles] = useState([]); // File state for uploaded and generated image
  const [status, setStatus] = useState("Idle"); // Default to "Idle"
  const [uploadProgress, setUploadProgress] = useState(0); // Progress of upload
  const [randomImages, setRandomImages] = useState([]); // Array for the random Images
  const [imageUrls, setImageUrls] = useState([]); // URL for previewing the latest images (changed to array)

  // Handle file selection from the user's computer
  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files); // Get all selected files
      setFiles(selectedFiles);
      const urls = selectedFiles.map((file) => URL.createObjectURL(file)); // Generate preview URLs
      setImageUrls(urls);
    }
  };

  // Fetch a random dog image and convert it to a file
  const fetchDogImage = async () => {
    try {
      const response = await axios.get("https://dog.ceo/api/breeds/image/random");
      const imageUrl = response.data.message; // Get the URL of the random dog image

      // Fetch the image as a blob
      const fetchUrl = await fetch(imageUrl);
      const blob = await fetchUrl.blob();

      // Convert the blob to a File object
      const dogFile = new File([blob], "DogImage.jpg", {
        type: "image/jpeg",
        // That's for meta type image is in jpeg format
      });

      // Update state with the new file and image URL
      setFiles([dogFile]); // Store as array for consistency
      setImageUrls([imageUrl]);
    } catch (error) {
      console.error("Error fetching random image:", error);
    }
  };

  // Handle file upload to the backend
  const handleFileUpload = async () => {
    if (!files.length) {
      // Changed from !files to !files.length to check array
      alert("No file selected!");
      return;
    }

    setStatus("Uploading");
    setUploadProgress(0);

    // Upload multiple files concurrently
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file); // Match backend's "file" key

      const response = await axios.post(
        "https://doggy-delights-backend.vercel.app/api/upload", // Fixed URL
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const progress = progressEvent.total
              ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
              : 0;
            // That's from axios helps me with how much file has been uploaded. Just for fun. Using ternary operator.
            setUploadProgress((prev) => {
              const totalProgress = files.reduce((acc, _, i) => {
                return acc + (i === files.indexOf(file) ? progress : prev / files.length);
              }, 0);
              return Math.min(totalProgress / files.length, 100);
            });
          },
        }
      );
      return response.data;
    });

    try {
      const responses = await Promise.all(uploadPromises);
      setStatus("Success");
      setUploadProgress(100); // upload is finished

      // Update the list of uploaded images
      const newImages = responses.map((data) => {
        const { name, imageUrl: uploadedUrl } = data;
        // Here I am doing object destructuring. Response.data is my object in backend holding the name and cloudinary Url. So I am just refering that get me the name value and Image Url I just renamed the value.
        return { id: Date.now() + Math.random(), imageUrl: uploadedUrl, name }; // Unique ID
      });
      setRandomImages([...randomImages, ...newImages]); // Spread operator new array including the previous files just adding new ones.
      setFiles([]); // Clear after upload
      setImageUrls([]);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Error");
      setUploadProgress(0);
    }
  };

  // Delete all images from Cloudinary
  const handleDeleteAll = async () => {
    try {
      const response = await axios.delete(
        "https://doggy-delights-backend.vercel.app/api/delete-all"
      );
      alert(response.data.message); // Giving User a Choice
      setRandomImages([]); // Clearing local images
      setImageUrls([]); // Reseting (changed to array)
      setFiles([]); // Reseting file (changed to array)
      setStatus("Idle"); // Reseting status
    } catch (error) {
      console.error("Error deleting images:", error);
      alert("Failed to delete images");
    }
  };

  return (
    <div className="flex justify-center gap-4 min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex-col items-center p-6 bg-[url('https://www.transparenttextures.com/patterns/paws.png')] bg-opacity-50">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold drop-shadow-lg animate-bounce">
          Welcome to Doggy Delights! 🐶
        </h1>
        <p className="text-xl font-semibold mt-4 max-w-2xl mx-auto drop-shadow-md">
          Calling all dog lovers! Share your favorite pup pics or fetch a random
          adorable doggo with just one click. Dive into our Gallery for a
          pawsome time filled with tail wags and cuteness overload!
        </p>
      </header>

      {/* Main Content */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg transform transition-all hover:scale-105">
        <h2 className="text-4xl font-bold text-center text-purple-600 mb-6">
          Woof Woof Uploads!
        </h2>

        {/* File Upload */}
        <div className="mb-6">
          <input
            id="file-upload"
            type="file"
            multiple // Added to allow multiple files
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload"
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-4 px-6 inline-block text-center shadow-md transform hover:scale-110"
          >
            Pick a Pup Pic 🐾
          </label>
        </div>

        {/* Random Image Generator */}
        <div className="mb-6">
          <button
            onClick={fetchDogImage}
            className="bg-pink-500 hover:bg-purple-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-4 px-6 inline-block text-center shadow-md transform hover:scale-110 animate-wiggle"
          >
            Fetch a Random Good Boy!
          </button>
        </div>

        {/* Delete All Button */}
        <div className="mb-6">
          <button
            onClick={handleDeleteAll}
            className="bg-red-500 hover:bg-red-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-4 px-6 inline-block text-center shadow-md transform hover:scale-110"
          >
            Clear Gallery 🗑️
          </button>
        </div>

        {/* Preview Images Using conditional rendering */}
        {imageUrls.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl text-center font-semibold text-purple-700 mb-2">
              Latest Pups
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Pup ${index}`}
                  className="w-full rounded-xl shadow-lg transform transition-all hover:rotate-3"
                />
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {files.length > 0 && (
          <div className="mb-6">
            <button
              onClick={handleFileUpload}
              className="bg-green-500 hover:bg-green-600 text-white font-bold w-full rounded-full py-4 px-6 transition-all duration-300 shadow-md transform hover:scale-110"
            >
              Upload to Doggy Heaven!
            </button>
          </div>
        )}

        {/* Upload Progress */}
        {status === "Uploading" && (
          <div className="mt-4">
            <p className="text-lg text-purple-700 mb-2">
              Uploading: {uploadProgress}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Upload Status Messages */}
        {status === "Success" && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl flex items-center">
            <span className="text-2xl mr-2">🐶</span> Uploaded to the Pack!
          </div>
        )}
        {status === "Error" && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-xl flex items-center">
            <span className="text-2xl mr-2">😿</span> Oops, Pup Got Lost!
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