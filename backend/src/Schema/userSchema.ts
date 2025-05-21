import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
  },
  profilePhoto: {
    type: String,
    // unique: true,
  },
  refreshToken: {
    type: String,
    unique: true,
  },
  loginType:{
    type:String,
  },
  generatedImages: {
    images: {
      imageUrl: String,
      publicId: String,
    },
  },
  folderName:{
    type:String,
    unique:true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const userModel = mongoose.model("user", userSchema);

export default userModel;
