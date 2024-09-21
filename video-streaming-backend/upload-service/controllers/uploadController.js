import aws from 'aws-sdk';
import { saveVideoDetails } from '../models/authModel.js';
aws.config.update({
  accessKeyId:process.env.UPLOAD_ACCESS_KEY_ID,
  secretAccessKey:process.env.UPLOAD_SECRET_ACCESS_KEY,
  region:process.env.UPLOAD_REGION
});

const s3 = new aws.S3();
const bucketName = 'stream-videos-rishabh';

export const initiateMultipartUpload =async(req,res)=>{
  const {key} = req.body;
  const params = {
        Bucket : bucketName,
         Key:key,
  
  }
  try {
    const response = await s3.createMultipartUpload(params).promise();
    res.status(201).json( {"uploadId":response.UploadId});
  } catch (error) {
    console.error('Error initiating multipart upload:', error);
    throw error;
  }

}

export const uploadPart =async(req,res) =>{
  const {key,partNumber ,totalParts } = req.body;
  console.log("part",partNumber,totalParts)
  const{uploadId} = req.query;
  const chunk = req.file;
  if (!chunk) {
    return res.status(400).send('No file uploaded.');
  }
  if (chunk.size < 5 * 1024 * 1024 && parseInt(partNumber)!==parseInt(totalParts)) {
    console.log("called small")
    return res.status(400).send('Part size is too small.');
  }
  const params={
    Key:key,
    Bucket:bucketName,
    Body:chunk.buffer,
    PartNumber:parseInt(partNumber),
    UploadId:uploadId,
  }
  try {
    const response = await s3.uploadPart(params).promise();
    res.status(200).json( {"ETag": response.ETag,"partNumber":partNumber})
  } catch (error) {
    console.error('Error uploading part:', error);
    throw error;
  }
}

export const completeMultipartUpload =async (req,res)=> {
  console.log("completeMultipartUpload")
  const{uploadId,key,author,description,title} =req.body;
  const completeParams ={
    Bucket:bucketName,
    UploadId:uploadId,
    Key:key
  }
  const data = await s3.listParts(completeParams).promise();

  const partss = data.Parts.map(part => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber
  }));
  const params = {
    Bucket: bucketName,
    Key: key,
    UploadId: uploadId,
    MultipartUpload: {
      Parts: partss.map((part) => ({
        PartNumber: parseInt(part.PartNumber),
        ETag: part.ETag
      }))
    }
  };

  try {
    const uploadResul =await s3.completeMultipartUpload(params).promise();
     const video_data = await saveVideoDetails(author,title,uploadResul.Location,description)
    res.status(200).json({"msg":"Upload is successfull.Video Processing will start soon and notify once it is available in different resolutions."});
  } catch (error) {
    console.error('Error completing multipart upload:', error);
    throw error;
  }
}