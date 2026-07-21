import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function Navbar(){

const {admin, logout}=useAuth();

const navigate = useNavigate();


const handleLogout=()=>{

logout();

navigate("/login");

};


return (

<div className="
h-20
bg-white/10
backdrop-blur-xl
border-b
border-white/10
flex
items-center
justify-between
px-8
">


<div>

<h2 className="
text-xl
font-bold
">
ANTIMATE ADMIN
</h2>

<p className="text-sm text-slate-400">
IoT Management Platform
</p>

</div>



<div className="flex items-center gap-6">


<div className="text-right">

<p className="font-semibold">
{admin?.name || admin?.fullName || "Admin"}
</p>

<p className="text-sm text-slate-400">
{admin?.email}
</p>

</div>



<button

onClick={handleLogout}

className="
flex
items-center
gap-2
text-red-400
hover:text-red-300
"

>

<LogOut size={18}/>

Logout

</button>


</div>


</div>

);

}