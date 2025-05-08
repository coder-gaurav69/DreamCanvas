import mongoose from 'mongoose';

const MongoDB = async (url:any) => {
  try {
    // const url = <string> process.env.MONGODB_URL;
    await mongoose.connect(url);
    console.log('MongoDB connected successfully');
  } catch (error:any) {
    const msg = error.message;
    console.log('MongoDB connection failed:',msg);
  }
};

export default MongoDB;
