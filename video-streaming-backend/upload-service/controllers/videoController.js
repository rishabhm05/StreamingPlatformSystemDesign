import dotenv from 'dotenv'
dotenv.config()
import aws from 'aws-sdk';
import { getVideosPaths } from '../models/authModel.js';
aws.config.update({
    accessKeyId:process.env.DOWNLOAD_ACCESS_KEY_ID,
    secretAccessKey:process.env.DOWNLOAD_SECRET_ACCESS_KEY,
    region:process.env.DOWNLOAD_REGION
  });

export const getAllVideos =async(req,res)=>{
const bucketName = 'stream-rishabh';
const s3 = new aws.S3();
const params={
    "Bucket":bucketName
}
const getS3VideoKeys = await getVideosPaths();
console.log(getS3VideoKeys,"s3"); 
params["Expires"] =3600;

const videourls =getS3VideoKeys.map((video)=>{
    params["Key"] = video.s3_path;
    let url = s3.getSignedUrl('getObject',params);
    return url;
})
res.status(200).json({videourls})
}