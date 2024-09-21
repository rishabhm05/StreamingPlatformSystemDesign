import { BrowserRouter as Router ,Routes,Route } from "react-router-dom"
import Home from "./components/Home"
import UploadVideos from "./components/UploadVideos"
import ProtectedRoutes from "./components/ProtectedRoute"
import { useContext, useEffect, useRef, useState } from "react"
import { AuthContext } from "./context/AuthContext"
import axiosInstance from "./utils/api"
import VideoPlayer from "./components/Video"
function App() {
  const [loginPopUp,setLoginPopUp] = useState(false);
  const{userDetails,setUserDetails,appToken} = useContext(AuthContext);
  const[videos,setVideos] = useState([]);
  const videoserviceref = useRef(null);
  useEffect(()=>{
    if(appToken){
      fetchUserDetails();
    }
  },[appToken])

  async function fetchUserDetails(){
     let res = await axiosInstance.get(`/user`);
     res = await res.data;
     console.log(res);
     setUserDetails(res);
  }
   useEffect(()=>{
    videoserviceref.current = setInterval(fetchVideos,3600000);
    return ()=>clearInterval(videoserviceref.current);
   },[])
   useEffect(()=>{
    fetchVideos();
   },[])
  async function fetchVideos(){
    let res = await axiosInstance.get(`/videos`);
    res = await res.data;
    setVideos(res.videourls)
  }
  console.log("videos",videos)
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home userDetails={userDetails} videos={videos} setUserDetails ={setUserDetails} setLoginPopUp={setLoginPopUp} loginPopUp={loginPopUp} />}/>
      
        <Route path="/upload" element={ <ProtectedRoutes token={appToken}><UploadVideos/></ProtectedRoutes>}/>
      </Routes>
     
    
    </Router>
  )
}

export default App
