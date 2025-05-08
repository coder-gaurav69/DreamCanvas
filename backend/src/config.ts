import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import path from 'path';

// Support for __dirname in ES6+ TypeScript
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const PORT: number = parseInt(process.env.PORT || '3000');
const FRONTEND_URL: string = process.env.FRONTEND_URL || "http://localhost:3000";
const MONGODB_URL: string = process.env.MONGODB_URL || '';
const JWT_SECRET_KEY_ACCESSTOKEN: string = process.env.JWT_SECRET_KEY_ACCESSTOKEN || '';
const JWT_SECRET_KEY_REFRESHTOKEN: string = process.env.JWT_SECRET_KEY_REFRESHTOKEN || '';
const CLOUDINARY_CLOUD_NAME: string = process.env.CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_API_KEY: string = process.env.CLOUDINARY_API_KEY || '';
const CLOUDINARY_API_SECRET: string = process.env.CLOUDINARY_API_SECRET || '';
const GOOGLE_CLIENT_ID:string = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET:string = process.env.GOOGLE_CLIENT_SECRET || ''; 
const GOOGLE_CALLBACK_URL:string = process.env.GOOGLE_CALLBACK_URL || ''; 
const SESSION_SECRET:string = process.env.SESSION_SECRET || ''; 
const TWITTER_API_KEY:string = process.env.TWITTER_API_KEY || ''; 
const TWITTER_API_KEY_SECRET:string = process.env.TWITTER_API_KEY_SECRET || ''; 
const TWITTER_CALLBACK_URL:string = process.env.TWITTER_CALLBACK_URL || ''; 



// console.log(CALLBACK_URL,GOOGLE_CLIENT_SECRET,GOOGLE_CLIENT_ID);

export { PORT, MONGODB_URL,JWT_SECRET_KEY_ACCESSTOKEN,JWT_SECRET_KEY_REFRESHTOKEN,CLOUDINARY_API_SECRET,CLOUDINARY_API_KEY,CLOUDINARY_CLOUD_NAME,FRONTEND_URL,GOOGLE_CLIENT_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CALLBACK_URL,SESSION_SECRET,TWITTER_API_KEY_SECRET,TWITTER_API_KEY,TWITTER_CALLBACK_URL};
