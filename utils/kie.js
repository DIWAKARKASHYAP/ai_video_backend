let token = "Bearer 1a32b8517b2374c04df071c4c82862d4"
export const kieGenerator= async (item)=>{
  try {
    const body = {
      model: "kling-2.6/motion-control",
      callBackUrl: "https://ai-video-backend-khaki.vercel.app/webhook-callback",
      input: item
    };

    const response = await fetch("https://api.kie.ai/api/v1/jobs/createTask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("Video generation error:", error);
    throw error;
  }
}


// video form task id

const videoByTaskId = async (taskId) => {
  try {
    const response = await fetch(
      `https://api.kie.ai/api/v1/jobs/recordInfo?taskId=${taskId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const responseData = await response.json();
    const data = responseData?.data;

    if (!data || !data.resultJson) return false;

    const parsedResult = JSON.parse(data.resultJson);

    return parsedResult?.resultUrls?.[0] || false;

  } catch (error) {
    console.error("Error fetching video:", error);
    return false;
  }
};