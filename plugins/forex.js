const { smd } = require("../lib");
const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

smd(
  {
    pattern: "xxdl",
    category: "downloads",
    desc: "Download a video from the provided URL",
    filename: __filename,
    use: "xxdl [video_url]",
  },
  async (message, match) => {
    try {
      if (!match) {
        return message.send("*Please provide a video URL.*");
      }

      const videoUrl = match;
      const response = await fetch(videoUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch video. Status: ${response.status}`);
      }

      const filename = path.basename(new URL(videoUrl).pathname);
      const fileStream = fs.createWriteStream(filename);

      response.body.pipe(fileStream);

      fileStream.on('finish', async () => {
        await message.send(`Video downloaded successfully.`, { quoted: message });
        fs.unlinkSync(filename); // Optionally delete file after sending
      });

      fileStream.on('error', async (error) => {
        console.error('Error writing file:', error);
        await message.error(error, "*Failed to download video.*");
      });
    } catch (error) {
      console.error(error);
      return message.error(error, "*Failed to download video.*");
    }
  }
);
