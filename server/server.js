const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const port = 4000;
const { exec } = require("child_process");
const { promisify } = require("util");
const execAsync = promisify(exec);

// Initialize express app
const app = express();

// Enable CORS with predefined options
app.use(
  cors({
    origin: "*", // Frontend domains
    optionsSuccessStatus: 200,
  })
);

// Set storage engine for multer
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: function (req, file, cb) {
    // Set a fixed file name
    const newFilename = "floor_plan.png";
    cb(null, newFilename);
  },
});

// Initialize upload variable with multer configuration
const upload = multer({
  storage: storage,
  // File filter for PNG files
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
}).single("file"); // 'file' is the name attribute in your form

// Check file type to ensure it's a PNG
function checkFileType(file, cb) {
  if (file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb("Error: Only PNG files are allowed!");
  }
}

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static("uploads"));

// Route for uploading PNG files
app.post("/upload-png", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.send({
        message: err,
      });
    } else {
      if (req.file == undefined) {
        res.send({
          message: "Error: No File Selected!",
        });
      } else {
        res.send({
          message: "File Uploaded!",
          fileInfo: {
            filename: req.file.filename,
            path: req.file.path,
          },
        });
      }
    }
  });
});

app.get("/process-projects", async (req, res) => {
  try {
    // Run the Python script and wait for it to finish
    await execAsync("python floor_plan.py", { cwd: __dirname });

    // Define the path to the output JSON file
    const outputJsonPath = path.join(
      __dirname,
      "jsons",
      "default_filename.json"
    );

    // Check if the output JSON file exists
    if (fs.existsSync(outputJsonPath)) {
      // Send the JSON file to the client
      res.sendFile(outputJsonPath);
    } else {
      // If the file does not exist, send an error message
      res.status(404).send("Output JSON file not found.");
    }
  } catch (error) {
    console.error(`Execution error: ${error}`);
    res.status(500).send(`Failed to execute Python script: ${error}`);
  }
});

// Start the server on the specified port
app.listen(port, () => console.log(`Server started on port ${port}`));
