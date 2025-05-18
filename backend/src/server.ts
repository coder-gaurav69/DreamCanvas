import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { FRONTEND_URL } from './config.js';
import MongoDB from './database/mongoDb.js';
import authRoute from './routes/auth.js';
import { PORT, MONGODB_URL } from './config.js';
import route from './routes/generate-delete-get-routes.js';
import { validate } from './MiddleWare/authorisation.js';
import { googleRoute , googleMiddleware } from './OAUTH/googleAuth.js';
import { twitterRoute , twitterMiddleware } from './OAUTH/twitterAuth.js';

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: `${FRONTEND_URL}`,
    // origin:'*',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE']
}));



// Health check route
app.get('/', (req: Request, res: Response) => {
    res.send('Welcome to Image Generator');
});

// Auth routes (login / register)
app.use('/auth', authRoute);

// routes for generating and deleting images from mongoDB and cloud and for getting
app.use('/',route)

// to get all the cookies
app.get('/test-cookies', (req, res) => {
  const user = req.cookies.user;
  res.status(200).json({
    message:'received successfully',
    cookies:user,
    success:true,
  });
});



// // Use Google OAuth middleware and routes
app.use(googleMiddleware);
app.use('/auth', googleRoute);


// // Use twitter OAuth middleware and routes
app.use(twitterMiddleware);
app.use(twitterRoute);




// route which validates users
app.post('/validate',validate,(req:Request,res:Response)=>{
  res.status(200).json({
    message:'User is authenticated',
    success:true
  })
})

// 404 fallback
// app.get('*', (req: Request, res: Response) => {
//     console.log('site not found');
//     res.status(404).send('Site not found');
// });

// Connect MongoDB
MongoDB(MONGODB_URL);


// Start server
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
