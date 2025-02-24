const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

// Middleware
app.use(cors({ origin: "https://doggy-delights-iota.vercel.app" })); // Usign my vercel frontend 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌥️ Cloudinary Config (Using environment variables on Vercel)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔥 Function to Generate Cool Random Dog Names
const generateDogName = () => {
  const names = [
    "Ace", "Apollo", "Archer", "Atlas", "Axel", "Bandit", "Baxter", "Blaze", "Bolt", "Boomer",
    "Bruno", "Cash", "Chase", "Chief", "Cobra", "Diesel", "Duke", "Echo", "Enzo", "Falcon",
    "Finn", "Flash", "Ghost", "Gizmo", "Harley", "Hunter", "Jax", "Jet", "Koda", "Loki",
    "Maverick", "Maximus", "Nero", "Nova", "Odin", "Onyx", "Ranger", "Rex", "Rocky", "Ryder",
    "Samson", "Shadow", "Storm", "Tank", "Titan", "Toby", "Turbo", "Viper", "Wolf", "Zeus"
  ];
  const randomName = names[Math.floor(Math.random() * names.length)];
  console.log(randomName);
  return randomName.replace(/\s+/g, "");
};

// 🎥 Set Up Multer Storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "dog-gallery",
    format: async () => "png",
    public_id: (req, file) => `${generateDogName()}-${Date.now()}`,
    // Here i am passing the params to dynamically generate the Id otherwise it would be same for all images. Here Cloudinary storage object expects some params. Req is my requested url and file object. 
  },
});
const upload = multer({ storage });



// Upload Endpoint
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const imageUrl = req.file.path;
  const publicId = req.file.filename;

  console.log(`Uploaded image: ${imageUrl} with Public ID: ${publicId}`);
  res.status(200).json({ name: publicId, imageUrl });
});

// 📂 GET Gallery
app.get("/gallery", async (req, res) => {
  try {
    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: "dog-gallery/",
      max_results: 20,
    });

    const images = response.resources.map((img) => {
      const publicIdParts = img.public_id.split("/");
      const fileName = publicIdParts[publicIdParts.length - 1];
      const randomDogName = fileName.split("-").slice(0, -1).join("-");

      return {
        id: img.asset_id,
        imageUrl: img.secure_url,
        name: randomDogName,
      };
    });

    res.status(200).json({ images });
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

//  Deleting All Images
app.delete("/delete-all", async (req, res) => {
  try {
    const response = await cloudinary.api.resources({
      type: "upload",
      prefix: "dog-gallery/",
      max_results: 500,
    });

    // Here the delete-all route accepts the delete request from forntend.
    // Response is getting the image list from cloudinary awaiting it.

    if (response.resources.length === 0) {
      return res.status(200).json({ message: "No images to delete" });
    } // If Zero Images then show the message. 

    const publicIds = response.resources.map((img) => img.public_id);

    // Simply mapping getting the images and then running a loop to delete them and max is 100 
    const ImagesArray = [];
    for (let i = 0; i < publicIds.length; i += 100) {
      const batch = publicIds.slice(i, i + 100); // Getting the first 100 images as thats the max limit
      ImagesArray.push(cloudinary.api.delete_resources(batch)); // Then push them to cloudinary to delete 
    }

    await Promise.all(ImagesArray); // If I have 250 images:
    // ImagesArray ends up with 3 promises (batches of 100, 100, and 50) Promise.all make it a single promise
  

    console.log(`Deleted ${publicIds.length} images`);
    res.status(200).json({ message: `Deleted ${publicIds.length} images` });
  } catch (error) {
    console.error("Error deleting images:", error);
    res.status(500).json({ error: "Failed to delete images" });
  }
});


module.exports = app;


