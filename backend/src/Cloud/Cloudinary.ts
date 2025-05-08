import {v2 as cloudinary} from 'cloudinary'
import path from 'path'
import {CLOUDINARY_API_SECRET,CLOUDINARY_API_KEY,CLOUDINARY_CLOUD_NAME} from '../config.js'

cloudinary.config({
    cloud_name:CLOUDINARY_CLOUD_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_API_SECRET
})

type CloudinaryUploadResult = {
    imageUrl: string;
    public_id: string;
};

// it will upload files to cloudinary
const uploadLocalFileToCloudinary = async (filePath:string,folder:string):Promise<CloudinaryUploadResult>=>{
    try {
        const result = await cloudinary.uploader.upload(filePath,{
            folder:folder
        })
        
        const data = {
            public_id:result.public_id,
            imageUrl:result.secure_url
        }

        return data;
        
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}



// it will delete the file from the cloudinary
const deleteFileFromCloudinary =  async (publicId:string):Promise<string>=>{
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Upload error:', error);
        throw error;
    }
}

export {uploadLocalFileToCloudinary,deleteFileFromCloudinary} 




