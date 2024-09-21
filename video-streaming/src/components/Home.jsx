import { createPortal } from "react-dom";
import Login from "./Login";
import Profile from "./Profile";
import VideoPlayer from "./Video";
const Home = ({ setLoginPopUp, loginPopUp ,userDetails ,setUserDetails,videos }) => {
  
  return (
    <>
    <div className="flex justify-between m-4">
      <h1 className="text-3xl ">Video Streaming Platform</h1>
      {!Object.keys(userDetails).length>0&&
      <button
        onClick={() => setLoginPopUp(!loginPopUp)}
        className="primary-button px-8"
      >
        Login/Sign Up
      </button>
      
}
      {Object.keys(userDetails).length>0?(<Profile userDetails={userDetails} setUserDetails={setUserDetails} />):(createPortal(
        <Login loginPopUp={loginPopUp} setLoginPopUp={setLoginPopUp} />,
        document.body
      ))}
    </div>
    <div className="flex flex-wrap">
   {videos.map((videoUrl)=>{
        return   <VideoPlayer key={videoUrl} videoUrl={videoUrl}/>
      })}
      </div>
    </>
  );
};
export default Home;
