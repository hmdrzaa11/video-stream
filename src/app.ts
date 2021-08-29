import express from "express";
import fs from "fs";

let app = express();

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", async (req, res) => {
  //get the range header from req
  let range = req.headers.range;
  if (!range) {
    return res.status(400).send({ err: "Requires a Range header" });
  }
  let videoPath = "dev.webm";
  //find the size of the video
  let videoStats = await fs.promises.stat(videoPath);
  let videoSize = videoStats.size;
  //each chunk size should be
  let chunkSize = 10 ** 6; //1MB
  //range format is like this "bytes=23232-"
  let start = parseInt(range.replace(/\D/g, "")); //gets the int part which is start
  let end = Math.min(start + chunkSize, videoSize - 1); //because we may get pass the video size so better to use "min" of those

  //content length header
  let contentLength = end - start + 1;

  let headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`, //video player uses this info to get the info that needed
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/webm",
  };

  //lets write the response header
  res.writeHead(206, headers);

  //now the actual sending and streaming
  let videoStream = fs.createReadStream(videoPath, { start, end }); //from where to where should be send

  videoStream.pipe(res);
});

app.listen(8000, "localhost", () => console.log("Listening on port 8000!"));
