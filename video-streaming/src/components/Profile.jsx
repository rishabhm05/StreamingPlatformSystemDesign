import { Link } from "react-router-dom";

const Profile = ({ userDetails, setUserDetails }) => {
  const handleLogOut = () => {
    localStorage.removeItem("token");
    setUserDetails({});
  };
  return (
    <div className="flex  items-center gap-10">
      <Link to="/upload"><a>Upload Videos</a></Link>
      <img
        onClick={handleLogOut}
        className=" rounded-full w-10 cursor-pointer"
        src={userDetails?.picture}
      />
    </div>
  );
};
export default Profile;
