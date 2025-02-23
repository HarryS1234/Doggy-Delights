import React, { useState } from "react";
import axios from "axios";

const DogImages = () => {
  const [file, setfile] = useState(null); // File state for uploaded/generated image
  const [status, setStatus] = useState("Idle"); // Default to "Idle"
  const [uploadProgress, setuploadProgress] = useState(0); // Progress of upload
  const [randomImages, setRandomImages] = useState([]); // Array for the random Images
  const [imageUrl, setimageUrl] = useState(null); // URL for previewing the latest image

  const handleFileChange = (e) => {
    if (e.target.files) {
      // This makes sure the files array is not empty and only set the setfile then
      setfile(e.target.files[0]);
    }
  };

  // Converting the random Image to a file jpeg
  const fetchDogImage = async () => {
    try {
      const response = await axios.get("https://dog.ceo/api/breeds/image/random");

      const imageUrl = response.data.message; // Getting the url

      console.log(imageUrl);

      const fetchUrl = await fetch(imageUrl); // cuz I Need the raw data object to upload it including my headers

      const blob = await fetchUrl.blob(); // blob is binary large object good for images

      const dogFile = new File([blob], "DogImage.jpg", {
        type: "image/jpeg",
      });

      // here i am creating a file object from the blob and random naming with metadata type and it tells browsers and servers what kind of data the file contains

      console.log(dogFile);

      setfile(dogFile);
      setimageUrl(imageUrl);
      // Automatically upload the random image to the backend
      await handleFileUpload(dogFile, imageUrl);
    } catch (error) {
      console.log(`Error fetching random Images: ${error}`);
    }
  };

  // Handling the fileUpload from my computer
  const handleFileUpload = async (fileToUpload = file, url = imageUrl) => {
    // This is an async funtion
    if (!fileToUpload) {
      return;
    } // If not file the function is returnedx

    setStatus("Uploading");
    setuploadProgress(0); // reset the upload progress

    const formData = new FormData();
    formData.append("file", fileToUpload); // I am creating a key which takes file as a value

    try {
      const response = await axios.post(
        "https://doggy-delights-backend.vercel.app/api/upload",
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
            setuploadProgress(progress);
          },
        }
      );

      setStatus("Success");
      setuploadProgress(100); // We have successfully uploaded to the server

      // Update randomImages with the uploaded image data from the backend
      const { name, imageUrl: uploadedUrl } = response.data;
      setRandomImages([...randomImages, { id: Date.now(), imageUrl: uploadedUrl, name }]);
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Error");
      setuploadProgress(0);
    }
  };

  // Delete all images from Cloudinary
  const handleDeleteAll = async () => {
    try {
      const response = await axios.delete("https://doggy-delights-backend.vercel.app/api/delete-all");
      console.log(response.data.message);
      alert(response.data.message);
      setRandomImages([]); // Clear local images
      setimageUrl(null); // Reset preview
      setfile(null); // Reset file
      setStatus("Idle"); // Reset status
    } catch (error) {
      console.error("Error deleting images:", error);
      alert("Failed to delete images");
    }
  };

  return (
    <div className="flex justify-center gap-4 min-h-screen bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex-col items-center p-6 bg-[url('https://www.transparenttextures.com/patterns/paws.png')] bg-opacity-50">
      {/* Header Explaining the Website */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold drop-shadow-lg animate-bounce">
          Welcome to Doggy Delights! 🐶
        </h1>
        <p className="text-xl font-semibold mt-4 max-w-2xl mx-auto drop-shadow-md">
          Calling all dog lovers! Share your favorite pup pics or fetch a random adorable doggo with just one click. Dive into our Gallery for a pawsome time filled with tail wags and cuteness overload!
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
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor="file-upload" // just to make it more pretty I have done this
            className="bg-purple-500 hover:bg-purple-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-4 px-6 inline-block text-center shadow-md transform hover:scale-110"
          >
            Pick a Pup Pic 🐾
          </label>
        </div>

        {/* Random Image Generator */}
        <div className="mb-6">
          <button
            onClick={fetchDogImage}
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold w-full cursor-pointer transition-all duration-300 rounded-full py-4 px-6 inline-block text-center shadow-md transform hover:scale-110 animate-wiggle"
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

        {/* Preview Image */}
        {imageUrl && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-purple-700 mb-2">Latest Pup:</h3>
            <img
              src={imageUrl}
              alt="Random Dog"
              className="w-full rounded-xl shadow-lg transform transition-all hover:rotate-3"
            />
          </div>
        )}

        {/* File Details */}
        {file && (
          <div className="bg-purple-50 rounded-xl p-4 mb-6">
            <h3 className="text-xl font-semibold text-purple-700 mb-2">Pup Stats:</h3>
            <p className="text-gray-800">
              <span className="font-medium">Name:</span> {file.name}
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Size:</span>{" "}
              {(file.size / 1024).toFixed(2)} KB
            </p>
            <p className="text-gray-800">
              <span className="font-medium">Type:</span> {file.type}
            </p>
          </div>
        )}

        {/* Upload Progress */}
        {file && status === "Uploading" && (
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

        {/* Upload Button */}
        {file && status !== "Uploading" && (
          // Here I am using conditonal redering and using AND operator so if my status is not uploading then only show Upload button
          <button
            onClick={handleFileUpload}
            className="bg-green-500 hover:bg-green-600 text-white font-bold w-full rounded-full py-4 px-6 mt-6 transition-all duration-300 shadow-md transform hover:scale-110"
          >
            Send to Doggy Heaven!
          </button>
        )}

        {/* Uploaded Successfully */}
        {status === "Success" && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-xl flex items-center">
            <span className="text-2xl mr-2">🐶</span> Uploaded to the Pack!
          </div>
        )}

        {/* Uploaded Unsuccessfully */}
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