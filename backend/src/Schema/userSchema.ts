import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profilePhoto: {
    type: String,
    unique: true,
  },
  refreshToken: {
    type: String,
    unique: true,
  },
  generatedImages: {
    images: {
      imageUrl: String,
      publicId: String,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userModel = mongoose.model("user", userSchema);

export default userModel;
