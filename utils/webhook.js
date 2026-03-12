import {videoByTaskId} from "./kie"
import {VideoRequest} from "../models"



export const updateDataByHook = async (task_id, code) => {
  try {
    // get video url from API
    const videoUrl = await videoByTaskId(task_id);

    const updateData = {
      status: code == 200 ? "completed": "failed",
    };

    if (videoUrl) {
      updateData.video_url = videoUrl;
    }

    const updatedDoc = await VideoRequest.findOneAndUpdate(
      { kie_task_id: task_id },
      updateData,
      { new: true }
    );

    return updatedDoc;

  } catch (error) {
    console.error("updateDataByHook error:", error);
    throw error;
  }
};