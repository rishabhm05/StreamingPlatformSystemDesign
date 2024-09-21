import dotenv from 'dotenv'
dotenv.config()
import express from "express";
import aws from 'aws-sdk';
import fs from "fs";
import { fileURLToPath } from 'url';
import path from "path";
import { dirname } from 'path';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import pool from "./dbConfig.js";
ffmpeg.setFfmpegPath(ffmpegStatic);
const app = express();
aws.config.update({
    accessKeyId:process.env.ACCESS_KEY_ID,
    secretAccessKey:process.env.SECRET_ACCESS_KEY,
    region:process.env.REGION
  });

const processVideo =async(bucketName,objectKey)=>{
    const s3 = new aws.S3();
   const params ={
    Bucket:bucketName,
    Key:objectKey
   }
   const readStream = s3.getObject(params).createReadStream();
   const outputFileName = `${Date.now()}_${objectKey}`
   const writeStream = fs.createWriteStream(outputFileName);
   
   readStream.pipe(writeStream);
   fs.mkdirSync('hls',{recursive:true});
   await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
    if (!fs.existsSync(outputFileName)) {
        console.error(`File does not exist: ${outputFileName}`);
        return;
    }

 await  generateHLS(outputFileName)

}
const sqs = new aws.SQS({ region: 'ap-south-1' });
const queueURL = process.env.QUEUE_URL;
// SQS Message
const sqsPoll =async()=>{
    const params ={
        WaitTimeSeconds:20, // will wait for 20 seconds before returning response back.
        MaxNumberOfMessages:1,
        QueueUrl:queueURL
    }
    try{
      let message = await  sqs.receiveMessage(params).promise()
      if(message.Messages&&message.Messages.length>0){
        const response = message.Messages[0];
        const body = JSON.parse(response.Body);
        console.log("Message Recieved from AWS SQS QUEUE ---->")
        const bucketname = body?.Records[0]?.s3.bucket.name;
        const objectKey = decodeURIComponent(body.Records[0].s3.object.key.replace(/\+/g, ' '));
        
        if(body.Event&&body.Event.includes("TestEvent")){
            console.log("Test Event Ignore it");
            return;
        }
        const deleteParams= {
            "QueueUrl" : queueURL,
            "ReceiptHandle": response.ReceiptHandle
        }
        let deletemessage = await sqs.deleteMessage(deleteParams).promise();
        console.log("deletemessafe",deletemessage)
        await processVideo(bucketname,objectKey);
        
      }
}
catch(err){
 console.log(err);       
}
}




// FFMPEG

const resolutions = [
    { resolution: '320x240', videoBitrate: '500k', audioBitrate: '64k' },
    { resolution: '480x320', videoBitrate: '1000k', audioBitrate: '128k' },
    { resolution: '854x480', videoBitrate: '1500k', audioBitrate: '128k' },
];
const variantPlaylists = [];

async function generateHLS(mp4FileName) {
    for (const { resolution, videoBitrate, audioBitrate } of resolutions) {
        console.log(`HLS conversion starting for ${resolution}`);
        const outputFileName = `${mp4FileName.replace('.', '_')}_${resolution}.m3u8`;
        const segmentFileName = `${mp4FileName.replace('.', '_')}_${resolution}_%03d.ts`;
        await new Promise((resolve, reject) => {
            ffmpeg(`./${mp4FileName}`)
                .outputOptions([
                    `-c:v h264`,
                    `-b:v ${videoBitrate}`,
                    `-c:a aac`,
                    `-b:a ${audioBitrate}`,
                    `-vf scale=${resolution}`,
                    `-f hls`,
                    `-hls_time 50`,
                    `-hls_list_size 0`,
                    `-hls_segment_filename hls/${segmentFileName}`
                ])
                .output(`hls/${outputFileName}`)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
        });

        variantPlaylists.push({ resolution, outputFileName });
        console.log(`HLS conversion done for ${resolution}`);
    }

    createMasterPlaylist(variantPlaylists,mp4FileName);
}

async function createMasterPlaylist(variantPlaylists,mp4FileName) {
    console.log(`HLS master m3u8 playlist generating`);
    let masterPlaylist = variantPlaylists.map(({ resolution, outputFileName }) => {
        const bandwidth = resolution === '320x240' ? 500000 :
                          resolution === '480x320' ? 1000000 :
                          resolution === '854x480' ? 1500000 :
                          2500000; // Bandwidth values for each resolution
        return `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${resolution}\n${outputFileName}`;
    }).join('\n');

    masterPlaylist = `#EXTM3U\n` + masterPlaylist;

    const masterPlaylistFileName = `${mp4FileName.replace('.', '_')}_master.m3u8`;
    const masterPlaylistPath = `hls/${masterPlaylistFileName}`;
    fs.writeFileSync(masterPlaylistPath, masterPlaylist);
    console.log(`HLS master m3u8 playlist generated`);
    await uploadtoS3();
    fs.unlinkSync(mp4FileName);
}
const uploadtoS3 =async()=>{
    const s3 = new aws.S3();
    const files = fs.readdirSync('hls');
    let bucketName = "stream-rishabh"
    for(const file of files){
        const filePath = path.join('hls',file);
        const fileContent = fs.readFileSync(filePath);
        const params = {
            Bucket: bucketName,
            Key: file,
            Body: fileContent,
            ContentType: file.endsWith('.m3u8') ? 'application/vnd.apple.mpegurl' : 'video/mp2t' 
        };

        try {
            const data = await s3.upload(params).promise();
            console.log("data",data)
            if(file.endsWith('master.m3u8')){
            const query = `Insert into gold."Stream" (s3_path,file_name) Values($1,$2) Returning *`;
            const params = [data.Key,file];
            const saveData = await pool.query(query,params);
            }
            fs.unlinkSync(filePath)
            console.log(`Uploaded ${file} to ${data.Location}`);
        } catch (err) {
            console.error(`Error uploading ${file}:`, err);
        }
    }

}
//uploadtoS3()
// Start the HLS generation processs
setInterval(sqsPoll,5000);
//await  generateHLS(`${Date.now()}_${objectKey}`)
app.listen(3001,()=>{
    console.log(`Server listen on Port 3001`)
})


