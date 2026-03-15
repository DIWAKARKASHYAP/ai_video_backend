import {videoByTaskId} from "./kie.js"
import {VideoRequest} from "../models.js"



export const updateDataByHook = async (task_id, code, data) => {
  try {
    // get video url from API
    // const videoUrl = await videoByTaskId(task_id);

    const updateData = {
      status: code == 200 ? "completed": "failed",
    };

    // if (videoUrl) {
    //   updateData.video_url = videoUrl;
    // }


    if(data?.resultJson){
      console.log('enter')
      let urlJson= data?.resultJson
      const parsed = JSON.parse(urlJson);
      const url = parsed.resultUrls[0];
      updateData.output_video_url = url
    }


    console.log(updateData)

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