import express from "express";
import dotenv from "dotenv";
import connectDB from "./db.js";
import { createUser, getUser, addCredits, removeCredits  } from "./controllers/user.js";
import { getAllVideos, uploadVideo  } from "./controllers/video.js";
import { getUserVideoRequests, generateVideo } from "./controllers/videoRequest.js";
import {updateDataByHook} from "./utils/webhook.js"

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import { upload } from "./utils/upload.js";

dotenv.config();

const app = express();
app.use(express.json());

connectDB();

/* ======================
   ROUTES
====================== */

app.use(express.static("public"));
app.post("/api/users", createUser);
app.post("/api/users/get", getUser);

app.get("/", (req, res) => {
  res.send("API Running");
});



app.post("/api/users/add-credits", addCredits);
app.post("/api/users/remove-credits", removeCredits);

app.get("/api/videos", getAllVideos);

app.get("/api/users/:userId/video-requests", getUserVideoRequests);

app.post("/api/generate-video", upload.single("image"), generateVideo);

app.post("/api/upload-video", upload.single("video"), uploadVideo);


// webhook

app.post('/webhook-callback', (req, res) => {
  const { code, msg, data } = req.body;
  
  // console.log('Received legitimate webhook request:', {
  //   taskId: data.task_id,
  //   status: code,
  //   callbackType: data.callbackType
  // });

  updateDataByHook(data.task_id, code )
  console.log(data.task_id, code , "}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}}")
  // Process callback data...
  
  res.status(200).json({ status: 'received' });
});
/* ======================
   SWAGGER SETUP
====================== */

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Video Backend API",
      version: "1.0.0",
      description: "API documentation for Video App"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ]
  },
  apis: ["./index.js"] // We define routes here
};

const swaggerSpec = swaggerJsdoc(options);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs at http://localhost:${PORT}/api-docs`);
});