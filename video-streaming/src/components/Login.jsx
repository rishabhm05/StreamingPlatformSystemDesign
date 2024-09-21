import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Login = ({ loginPopUp, setLoginPopUp }) => {
  const{setAppToken} = useContext(AuthContext);
  const navigate = useNavigate();
  const onSuccess = async (response) => {
    if(response){
    const data ={
      "token":response['credential']
    }
    try{
    let res = await axiosInstance.post(`/auth/google`,data);
    res  = await res.data;
    localStorage.setItem("token",res['jwt-token']);
    setAppToken(res['jwt-token']);
    navigate("/upload");
    }
    catch(err){
      console.log(err);
      navigate('/');
    }
  };
}
  const onError = (error) => {
    console.log(error);
  };
  return (
    <>
      {loginPopUp && (
        <div
          onClick={() => setLoginPopUp(false)}
          className=" fixed inset-0  cursor-pointer bg-[rgba(0,0,0,0.5)]"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-whitesmoke max-w-[400px]  h-[400px]  bg-[whitesmoke] items-center  flex flex-col mx-auto py-4 my-4 rounded-md"
          > 
          <div className="py-4 flex flex-col gap-8 items-center">
            <h1 className="text-2xl font-bold">Sign With Google</h1>
            <GoogleLogin  onSuccess={onSuccess} onError={onError} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Login;
