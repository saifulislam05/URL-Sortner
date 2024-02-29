import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

const isUrlValid = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Function to safely read the URL database file
function readUrlDatabase() {
  try {
    const fileResponse = fs.readFileSync("urlDatabase.json", {
      encoding: "utf8",
      flag: "a+",
    });
    // If the file is empty, initialize it with an empty object
    return fileResponse ? JSON.parse(fileResponse) : {};
  } catch (error) {
    console.error("Error reading or parsing urlDatabase.json:", error);
    // Return an empty object in case of error
    return {};
  }
}

// Send UI HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/sort-url", (req, res) => {
  const longUrl = req.body.url;
  if (!longUrl) {
    return res.status(400).json({
      success: false,
      message: "No URL provided",
    });
  }
  const shortUrl = nanoid(8);
  const isValid = isUrlValid(longUrl);
  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Invalid URL",
    });
  }

  // Read existing data
  const fileData = readUrlDatabase();

  fileData[shortUrl] = longUrl;

  fs.writeFileSync("urlDatabase.json", JSON.stringify(fileData, null, 2));
  res.json({
    success: true,
    url: `https://url-sortner-5i18.onrender.com/${shortUrl}`,
  });
});

// Redirect to original URL
app.get("/:shortURL", (req, res) => {
  const fileData = readUrlDatabase();
  const longUrl = fileData[req.params.shortURL];
  if (!longUrl) {
    return res.status(404).json({
      success: false,
      message: "Provided URL is not an instance of any Long URL",
    });
  }
  res.redirect(longUrl);
});

app.listen(10000, () => console.log("Server is running on port 5000"));
