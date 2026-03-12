import {VideoRequest} from "../models.js";

import b2, {initB2} from "../utils/backblaze.js";
import {uploadImageToB2, targetVideoDetails} from "../utils/helper.js"
import {kieGenerator} from "../utils/kie.js";

/* =========================
   GET ALL VIDEO REQUESTS
   FOR A SPECIFIC USER
========================= */
export const getUserVideoRequests=async (req, res) => {
  try {
    const {userId}=req.params;

    const requests=await VideoRequest.find({
      user_id: userId
    }).sort({createdAt: -1});

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




export const generateVideo=async (req, res) => {
  try {
    const {id, email}=req.body;
    const image=req.file;

    if (!id||!email) {
      return res.status(400).json({
        success: false,
        message: "Missing id or email"
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required"
      });
    }

    // Upload image to B2
    const imageUrl=await uploadImageToB2(image);

    const target_detail=await targetVideoDetails(id)
    console.log(target_detail)

    let kie_item={
      prompt: target_detail.prompt,
      input_urls: [
        imageUrl
      ],
      video_urls: [
        target_detail.video_url
      ],
      character_orientation: "video",
      mode: "720p"
    }

    let task_id=''
    let kie_res=await kieGenerator(kie_item)
    if (kie_res.code==200) {
      task_id=kie_res.data.taskId
    } else {
      res.json({
        success: false,
        message: "failed to generation",
      });
    }
    console.log(await x)

    // Save request
    const request=await VideoRequest.create({
      user_id: email, // replace with actual user _id if available
      target_video_id: id,
      image_url: imageUrl,
      status: "processing",
      kie_task_id: task_id
    });

    res.json({
      success: true,
      message: "Video generation request created",
      data: request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// {
//   code: 200,
//   msg: 'success',
//   data: {
//     taskId: '0ad608008833e83964bcb0f5c377e929',
//     recordId: '0ad608008833e83964bcb0f5c377e929'
//   }
// }

// {
//   code: 200,
//   msg: 'success',
//   data: {
//     taskId: 'ce54f055ca4f88bf5fc4a4b332c2f20a',
//     recordId: 'ce54f055ca4f88bf5fc4a4b332c2f20a'
//   }
// }