import b2, { initB2 } from "../utils/backblaze.js";
import { Video } from "../models.js";

const BUCKET_ID = '53f26751f7a7761e96cf0014'
const BUCKET_NAME = 'ai-video-app'

export function convertUrl(url) {
  return url.replace("f000", "f005");
}

export const uploadImageToB2 = async (file) => {
  await initB2();

  const folderName = "video-request-images";

  const sanitizedName = file.originalname
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  const fileName = `${folderName}/${Date.now()}-${sanitizedName}`;

  const uploadUrlResponse = await b2.getUploadUrl({
    bucketId: BUCKET_ID
  });

  await b2.uploadFile({
    uploadUrl: uploadUrlResponse.data.uploadUrl,
    uploadAuthToken: uploadUrlResponse.data.authorizationToken,
    fileName,
    data: file.buffer,
    contentLength: file.size,
    mime: file.mimetype
  });

  const fileUrl = `https://f000.backblazeb2.com/file/${BUCKET_NAME}/${fileName}`;

  return convertUrl(fileUrl);
};



export const targetVideoDetails = async (videoId) => {
  try {
    if (!videoId) {
      throw new Error("Video ID is required");
    }

    const video = await Video.findById(videoId); // fetch full JSON

    if (!video) {
      throw new Error("Video not found");
    }

    return video; // return full document

  } catch (error) {
    throw error;
  }
};