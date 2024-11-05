import React from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie"; // Import js-cookie

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("access_token"); // Remove access token cookie
    Cookies.remove("refresh_token"); // Remove refresh token cookie
    router.push("/login"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full mt-auto bg-transparent border border-red-600 text-red-600 px-4 py-2 rounded-lg transition duration-200 outline-none focus:outline-none"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
