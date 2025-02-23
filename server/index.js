const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "https://doggy-delights-iota.vercel.app"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌥️ Cloudinary Config (Load from .env file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//Function to Generate Cool Random Dog Names
const generateDogName = () => {
  const names = [
    "Ace", "Apollo", "Archer", "Atlas", "Axel", "Bandit", "Baxter", "Blaze", "Bolt", "Boomer",
    "Bruno", "Cash", "Chase", "Chief", "Cobra", "Diesel", "Duke", "Echo", "Enzo", "Falcon",
    "Finn", "Flash", "Ghost", "Gizmo", "Harley", "Hunter", "Jax", "Jet", "Koda", "Loki",
    "Maverick", "Maximus", "Nero", "Nova", "Odin", "Onyx", "Ranger", "Rex", "Rocky", "Ryder",
    "Samson", "Shadow", "Storm", "Tank", "Titan", "Toby", "Turbo", "Viper", "Wolf", "Zeus"
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];

  console.log(randomName); // 
  return randomName.replace(/\s+/g, ""); // Remove spaces
};

// 🎥 Set Up Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dog-gallery", // ✅ Folder name is set here
    format: async (req, file) => "png", // Convert to PNG
    public_id: (req, file) => {
      const randomDogName = generateDogName(); // Generate cool random dog name
      return `${randomDogName}-${Date.now()}`; // ✅ Do not include folder name here
    },
  },
});
const upload = multer({ storage });



//  Upload Endpoint (Saves to Cloudinary)
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = req.file.path; // Cloudinary URL
  const publicId = req.file.filename; // Extract public_id from the uploaded file

  console.log(`Uploaded image: ${imageUrl} with Public ID: ${publicId}`);
  res.status(200).json({ name: publicId, imageUrl });
});

//  GET all images from Cloudinary folder
app.get("/gallery", async (req, res) => {
  try {
    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: "dog-gallery/", // Ensure this matches the folder name
      max_results: 20,
    });

    const images = response.resources.map((img) => {
      const publicIdParts = img.public_id.split("/"); // Split by "/"
      const fileName = publicIdParts[publicIdParts.length - 1]; // Get the last part (e.g., "❖Maverick❖-1740290838173")
      const randomDogName = fileName.split("-").slice(0, -1).join("-"); // Extract the random dog name (e.g., "❖Maverick❖")

      return {
        id: img.asset_id,
        imageUrl: img.secure_url,
        name: randomDogName, // Use the extracted random dog name
      };
    });

    res.status(200).json({ images });
  } catch (error) {
    console.error("Error fetching Cloudinary images:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));