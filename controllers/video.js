import { Video } from "../models.js";
import b2, { initB2 } from "../utils/backblaze.js";


const BUCKET_ID = '53f26751f7a7761e96cf0014'
/* =========================
   GET ALL VIDEOS
========================= */
export const getAllVideos = async (req, res) => {
  try {

    console.log("------------------")
    const videos = await Video.find().sort({ createdAt: -1 });

    const grouped = {};

    videos.forEach((video) => {
      if (!grouped[video.heading]) {
        grouped[video.heading] = [];
      }

      grouped[video.heading].push({
        _id: video._id,
        heading: video.heading,
        title: video.title,
        video_url: video.video_url,
        video_gif: video.video_gif,
        description: video.description,
        prompt: video.prompt,
        duration_seconds: video.duration_seconds,
        createdAt: video.createdAt,
        updatedAt: video.updatedAt,
      });
    });

    const formattedData = Object.keys(grouped).map((heading, index) => ({
      id: (index + 1).toString(),
      heading: heading,
      items: grouped[heading],
    }));

    res.json({
      success: true,
      count: videos.length,
      sections: formattedData,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};



export const uploadVideo = async (req, res) => {
  try {
    const {
      heading,
      title,
      description,
      prompt,
      duration_seconds
    } = req.body;

    // ✅ Validate required fields
    if (!heading || !title || !description || !prompt || !duration_seconds) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required"
      });
    }

    // ✅ Convert duration to number safely
    const duration = Number(duration_seconds);
    if (isNaN(duration) || duration < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid duration_seconds"
      });
    }

    await initB2();

    const folderName = "template-videos";

    // ✅ Strong filename sanitization
    const sanitizedName = req.file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9.-]/g, "");

    const fileName = `${folderName}/${Date.now()}-${sanitizedName}`;

    // ✅ Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: BUCKET_ID
    });

    // ✅ Upload to Backblaze
    await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName,
      data: req.file.buffer,
      contentLength: req.file.size,
      mime: req.file.mimetype
    });

    // ✅ Use correct public bucket URL
    const fileUrl = `https://f000.backblazeb2.com/file/${BUCKET_NAME}/${fileName}`;

    // ✅ Save in MongoDB
    const video = await Video.create({
      heading,
      title: title.trim(),
      description,
      prompt,
      duration_seconds: duration,
      video_url: fileUrl,
      video_gif: null
    });

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: video
    });

  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload video"
    });
  }
};