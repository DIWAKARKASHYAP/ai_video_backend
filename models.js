import mongoose from "mongoose";

/* ======================
   USER SCHEMA
====================== */
const userSchema=new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    photo: {
      type: String,
    },

    idToken: {
      type: String,
      required: true,
    },

    credits: {
      type: Number,
      default: 0,
      min: [0, "Credits cannot be negative"],
    },
  },
  {timestamps: true});

export const User=mongoose.model("User", userSchema);


/* ======================
   VIDEO SCHEMA
====================== */
const videoSchema=new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    video_url: {
      type: String,
      required: true
    },
    video_gif: {
      type: String,
      required: false
    },
    description: {
      type: String,
      required: true
    },
    prompt: {
      type: String,
      required: true
    },
    duration_seconds: {
      type: Number,
      required: true,
      min: 0
    },

  },
  {timestamps: true}
);

export const Video=mongoose.model("Video", videoSchema);


/* ======================
   VIDEO REQUEST SCHEMA
====================== */
const videoRequestSchema=new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    video_url: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending"
    },
    output_video_url: {
      type: String,
      default: null
    }
  },
  {timestamps: true}
);

videoRequestSchema.index({user_id: 1});
videoRequestSchema.index({status: 1});

export const VideoRequest=mongoose.model("VideoRequest", videoRequestSchema);