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
  type: [
    {
      _id: false,
      imageUrl: String,
      publicId: String,
      timeStamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  default: [], // Optional but good practice to avoid `undefined`
}
,
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
