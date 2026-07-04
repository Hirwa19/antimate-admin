import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  Home,
  Users,
  Server,
  Settings,
  LogOut,
  Cpu
} from "lucide-react";



export default function Sidebar() {


  const { logout } = useAuth();

  const navigate = useNavigate();



  const logoutUser = () => {

    logout();

    navigate("/login");

  };




  return (

    <div
      className="
      w-64
      min-h-screen
      bg-slate-900
      text-white
      border-r
      border-white/10
      p-6
      flex
      flex-col
      "
    >



      {/* BRAND */}

      <h1
        className="
        text-2xl
        font-bold
        mb-10
        "
      >

        ANTIMATE

      </h1>





      {/* MENU */}

      <nav
        className="
        flex-1
        space-y-4
        "
      >



        <button

          onClick={() => navigate("/")}

          className="
          w-full
          flex
          gap-3
          items-center
          hover:text-blue-400
          transition
          "

        >

          <Home size={20}/>

          Dashboard

        </button>






        <button

          onClick={() => navigate("/users")}

          className="
          w-full
          flex
          gap-3
          items-center
          hover:text-blue-400
          transition
          "

        >

          <Users size={20}/>

          Users

        </button>






        <button

          onClick={() => navigate("/gateways")}

          className="
          w-full
          flex
          gap-3
          items-center
          hover:text-blue-400
          transition
          "

        >

          <Server size={20}/>

          Gateways

        </button>







        <button

          onClick={() => navigate("/generate-device")}

          className="
          w-full
          flex
          gap-3
          items-center
          hover:text-blue-400
          transition
          "

        >

          <Cpu size={20}/>

          Generate Node

        </button>







        <button

          onClick={() => navigate("/settings")}

          className="
          w-full
          flex
          gap-3
          items-center
          hover:text-blue-400
          transition
          "

        >

          <Settings size={20}/>

          Settings

        </button>



      </nav>








      {/* LOGOUT */}

      <button

        onClick={logoutUser}

        className="
        w-full
        flex
        gap-3
        items-center
        text-red-400
        hover:text-red-300
        transition
        "

      >

        <LogOut size={20}/>

        Logout


      </button>





    </div>

  );

}