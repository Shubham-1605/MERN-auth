import React from "react";
import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const Navigate = useNavigate();
  const { userData, backend_url, setUserData, setIsLoggedIn } =
    React.useContext(AppContext);

  const sendVerificationotp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backend_url + "/api/auth/send-verify-otp",
      );

      if (data.success) {
        Navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backend_url + "/api/auth/logout");
      data.success && setIsLoggedIn(false);
      data.success && setUserData(false);
      Navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center px-6 sm:px-24 py-6">
      <img
        src={assets.logo}
        alt="logo"
        className="w-28 sm:w-32 cursor-pointer"
      />

      {userData ? (
        <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white relative group">
          {userData.name[0].toUpperCase()}

          <div className="absolute hidden group-hover:block  top-0 right-0 z-10 text-black rounded pt-10 ">
            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
              {!userData.isAccountVerified && (
                <li
                  onClick={sendVerificationotp}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer"
                >
                  Verify email
                </li>
              )}
              <li
                onClick={logout}
                className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
              >
                Logout
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <button
          onClick={() => Navigate("/login")}
          className="flex items-center gap-2 border border-gray-300 rounded-full px-7 py-5 text-sm font-medium cursor-pointer"
        >
          Login
          <img src={assets.arrow_icon} alt="" className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Navbar;
