import { createContext, useState } from "react";

export const AuthContext = createContext(null);
const Context =({children})=>{
const[appToken,setAppToken] = useState(localStorage.getItem("token"));
const [userDetails,setUserDetails] = useState({});
return <AuthContext.Provider value={{userDetails,setUserDetails,appToken,setAppToken}} >{children}</AuthContext.Provider>
}
export default Context;