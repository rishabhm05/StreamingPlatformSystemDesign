import { useRef, useState } from "react";
import axiosInstance from "../utils/api";
import ProgressBar from "@ramonak/react-progress-bar";
const UploadVideos = () => {
  const inputref = useRef(null);
  const[Title,setTitle] =useState("");
  const[Author,setAuthor] = useState("");
  const[Description,setDescription] = useState("");
  const [file, setFile] = useState("");
  const[progress,setProgress] = useState(0);
  const [showProgress,setShowProgress] = useState(false);
  const handleClick = () => {
    inputref.current.click();
  };
  const handleFileChange = (e) => {
    const fileinput = e.target.files[0];
    if (fileinput && fileinput.type.startsWith("video/")) {
      setFile(fileinput);
    } else {
      alert("Please select an mp4 file.");
    }
  };
  const multipartUpload =async()=>{
    console.log(file);
   const data = {
    "key" :file.name
   };

   const formData = new FormData();
    formData.append('key', file.name);
   
   let res = await axiosInstance.post(`/upload/initiateMultipartUpload`,data,{
    headers:{
      'Content-Type':'multipart/form-data'
    }
   });
   res = await res.data;
   return res.uploadId;
   //setUploadId(res.uploadId);
   
  }
  
  const uploadParts = async(uploadId)=>{
    const chunksize = 6*1024*1024;
    const totalchunks = Math.ceil(file.size/chunksize);
     let promises =[];
    let partNumber =1;
    for(let i=0;i<totalchunks;i++){
      let start = i*chunksize;
      let end = Math.min(start+chunksize,file.size);
      let chunk =file.slice(start,end);
      const formData = new FormData();
      formData.append("chunk", chunk); 
      formData.append("partNumber", partNumber);  
      formData.append("key", file.name); 
      formData.append("totalParts", totalchunks);
      const upload = await axiosInstance.post(`/upload/uploadPart?uploadId=${uploadId}`,formData,{
        headers:{
          'Content-Type':'multipart/form-data'
        }
    }).then((res)=>res.data).catch((err)=>console.log(err));
      promises.push(upload);
      setProgress((prevprogress)=>{
        const totalUploaded = prevprogress + Math.ceil((chunk.size / file.size) * 100);
       return Math.min(totalUploaded, 100);
      })
      partNumber++;
    }
   const Etags =await Promise.all(promises);
    return Etags;
    
  }
  const CompletedUpload =async(Etags,uploadId)=>{
     const data={
      "parts":Etags,
      "uploadId":uploadId,
      "key" : file.name,
      "title":Title,
      "author" :Author,
      "description" :Description
     }
     let completeresult = await axiosInstance.post(`/upload/completeMultipartUpload`,data);
     completeresult = await completeresult.data;
     console.log(completeresult);
  }
  const handleSubmit =async()=>{
    try{
      setShowProgress(true);
    let uploadId = await multipartUpload();
     let Etags =await uploadParts(uploadId);
     await CompletedUpload(Etags,uploadId);
     setAuthor("");
     setTitle("");
     setDescription("");
     setFile("")
     showProgress(0)
    }
    catch(err){
      console.log(err);
    }
  }

  return (
    <>
    <div className="flex   mt-4 flex-col gap-10  max-w-[400px]  mx-auto ">
      <h1 className="text-2xl font-bold">Upload Videos</h1>
    
      <input className="input" type="text"  placeholder="Title of Video*" onChange={(e)=>setTitle(e.target.value)} value={Title}/>
    
      <input  className="input" type="text"  placeholder="Enter Author Name*" onChange={(e)=>setAuthor(e.target.value)} value={Author}/>
      <textarea  cols={50} rows={5} className=" border-2 border-black p-2 rounded-md " type="text" placeholder="Enter description(optional)" onChange={(e)=>setDescription(e.target.value)} value={Description}/>
      <input
        type="file"
        ref={inputref}
        className="hidden"
        
        onChange={handleFileChange}
        name='chunk'
        
      />
      {!file &&<button className="primary-button mx-auto" onClick={handleClick}>
        Choose a File to upload
      </button>}
      {file&& <button  disabled={!Title||!Author}   className="primary-button mx-auto disabled:bg-gray-600 " onClick={handleSubmit}>Submit</button>}
     {file&&showProgress&& <div className="w-[400px]">
      <ProgressBar completed={progress}/>
      </div>
}
    </div>
     
   
    </>
  );
};
export default UploadVideos;
