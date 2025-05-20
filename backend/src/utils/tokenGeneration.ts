import jwt from "jsonwebtoken";
import {
  JWT_SECRET_KEY_REFRESHTOKEN,
  JWT_SECRET_KEY_ACCESSTOKEN,
  SESSION_SECRET
} from "../config.js";

export const generateToken = (id:string,email:string)=>{

    const accessToken = jwt.sign({id,email,SESSION_SECRET}, JWT_SECRET_KEY_ACCESSTOKEN, {
          expiresIn: "1h",
    });

    const refreshToken = jwt.sign({id,email,SESSION_SECRET}, JWT_SECRET_KEY_REFRESHTOKEN, {
          expiresIn: "24h",
    });

    return [accessToken,refreshToken];
}


// export const ValidateToken = ( accessToken:string, refreshToken:string, id:string, loginType:string ,folderName:string)=>{

//     if (loginType == "Google") {
//     console.log('working fine google')
//     return next();
//   }

//   else if(loginType == "Facebook"){
//     console.log('Logged in from Github');
//     return next();
//   }

//   else if (loginType == "Github") {
//     console.log('Logged in from Github');
//     return next();
//   }

//   // for custom email validation
//   else if (loginType == "Email") {
//     jwt.verify(
//       accessToken,
//       JWT_SECRET_KEY_ACCESSTOKEN,
//       async (err: any, decoded: any): Promise<void> => {
//         if (err) {
//           const userExists = await userModel.findById(id).select("-password -generatedImages -userName");

//           if (!userExists) {
//             res.status(404).json({
//               message: "User not found, please create your account",
//               success: false,
//             });
//             return;
//           }

//           const newAccessToken = jwt.sign({ id }, JWT_SECRET_KEY_ACCESSTOKEN, { expiresIn: "5h" });
//           const newRefreshToken = jwt.sign({ id }, JWT_SECRET_KEY_REFRESHTOKEN, { expiresIn: "24h" });

//           await userModel.findByIdAndUpdate(id, {
//             $set: { refreshToken: newRefreshToken },
//           });

//           res.cookie("user", {
//             accessToken: newAccessToken,
//             refreshToken: newRefreshToken,
//             id,
//             loginType: "Email"
//           });

//           return next();
//         }
//         console.log('sahi chl rhaa hai na');
//         return next(); // access token is valid
//       }
//     );
//   }
// }

