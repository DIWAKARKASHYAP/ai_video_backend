import { VideoRequest } from "../models.js";

import b2, { initB2 } from "../utils/backblaze.js";

const BUCKET_ID = '53f26751f7a7761e96cf0014'


/* =========================
   GET ALL VIDEO REQUESTS
   FOR A SPECIFIC USER
========================= */
export const getUserVideoRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await VideoRequest.find({
      user_id: userId
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};





export const generateVideo = async (req, res) => {
  try {
    const { referenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Video file is required"
      });
    }

    if (!referenceId) {
      return res.status(400).json({
        success: false,
        message: "referenceId is required"
      });
    }

    await initB2();

    const fileName = `${referenceId}-${Date.now()}.mp4`;

    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: BUCKET_ID
    });

    const uploadResponse = await b2.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName,
      data: req.file.buffer,
      contentLength: req.file.size,
      mime: req.file.mimetype
    });

    const fileUrl = `https://f000.backblazeb2.com/file/request_video/${fileName}`;

    // Save in DB
    const request = await VideoRequest.create({
      user_id: referenceId, // assuming referenceId = userId
      video_url: fileUrl,
      status: "pending"
    });

    res.status(201).json({
      success: true,
      message: "Video uploaded successfully",
      data: request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};