import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';

// Support for __dirname in ES6+ TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });


// Port info
const PORT: number = parseInt(process.env.PORT || '3000');


// frontend url
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:5173";

// AI model url
const AI_MODEL_MAP = {
  Realistic: process.env.MODEL_REALISTIC,
  Artistic: process.env.MODEL_ARTISTIC,
  "3D Render": process.env.MODEL_3D,
  Cartoon: process.env.MODEL_CARTOON,
  Fantasy: process.env.MODEL_FANTASY,
//   ProHD: process.env.MODEL_PRO_HD,
};
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_API_TOKEN= process.env.CF_API_TOKEN
const CF_MODEL_ID= process.env.CF_MODEL_ID;


// mongodb connection url
const MONGODB_URL: string = process.env.MONGODB_URL || '';


// jwt credentials
const JWT_SECRET_KEY_ACCESSTOKEN: string = process.env.JWT_SECRET_KEY_ACCESSTOKEN || '';
const JWT_SECRET_KEY_REFRESHTOKEN: string = process.env.JWT_SECRET_KEY_REFRESHTOKEN || '';


// cloudinary credentials
const CLOUDINARY_CLOUD_NAME: string = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET: string = process.env.CLOUDINARY_API_SECRET || '';


// google credentials
const GOOGLE_CLIENT_ID:string = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET:string = process.env.GOOGLE_CLIENT_SECRET || ''; 
const GOOGLE_CALLBACK_URL:string = process.env.GOOGLE_CALLBACK_URL || ''; 
const SESSION_SECRET:string = process.env.SESSION_SECRET || ''; 



// facebook credentials
const FACEBOOK_APP_ID:string = process.env.FACEBOOK_APP_ID || ''; 
const FACEBOOK_CALLBACK_URL:string = process.env.FACEBOOK_CALLBACK_URL || ''; 
const FACEBOOK_APP_SECRET:string = process.env.FACEBOOK_APP_SECRET || ''; 


//github credentials
const GITHUB_CLIENT_ID:string = process.env.GITHUB_CLIENT_ID || ''; 
const GITHUB_CLIENT_SECRET:string = process.env.GITHUB_CLIENT_SECRET || ''; 
const GITHUB_CALLBACK_URL:string = process.env.GITHUB_CALLBACK_URL || ''; 


//twitter credentials
const TWITTER_CONSUMER_KEY:string = process.env.GITHUB_CLIENT_ID || ''; 
const TWITTER_CONSUMER_SECRET:string = process.env.GITHUB_CLIENT_SECRET || ''; 
const TWITTER_CALLBACK_URL:string = process.env.GITHUB_CALLBACK_URL || ''; 




export { PORT, MONGODB_URL,JWT_SECRET_KEY_ACCESSTOKEN,JWT_SECRET_KEY_REFRESHTOKEN,CLOUDINARY_API_SECRET,CLOUDINARY_API_KEY,CLOUDINARY_CLOUD_NAME,FRONTEND_URL,GOOGLE_CLIENT_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CALLBACK_URL,SESSION_SECRET,FACEBOOK_CALLBACK_URL,FACEBOOK_APP_ID,FACEBOOK_APP_SECRET,GITHUB_CALLBACK_URL,GITHUB_CLIENT_SECRET,GITHUB_CLIENT_ID,TWITTER_CONSUMER_KEY,TWITTER_CONSUMER_SECRET,TWITTER_CALLBACK_URL,AI_MODEL_MAP,CF_ACCOUNT_ID,CF_API_TOKEN,CF_MODEL_ID};
