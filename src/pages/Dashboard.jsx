import {useEffect,useState} from "react";
import api from "../api/axios";


export default function Dashboard(){


const [stats,setStats]=useState(null);



useEffect(()=>{


const load =
async()=>{


try{


const res =
await api.get(
"/dashboard/stats"
);


console.log(
"DASHBOARD:",
res.data
);



setStats(
res.data.stats
);



}
catch(err){

console.log(
err
);

}


};


load();


},[]);




return (

<div className="
p-8
text-white
">


<h1 className="
text-4xl
font-bold
mb-8
">

ANTIMATE CONTROL CENTER

</h1>



{
!stats ?

<p>
Loading...
</p>

:

<div className="
grid
grid-cols-2
md:grid-cols-4
gap-5
">


<Card
title="Customers"
value={stats.users}
/>


<Card
title="Staff"
value={stats.admins}
/>


<Card
title="Devices"
value={stats.devices}
/>


<Card
title="Active Devices"
value={stats.activeDevices}
/>



</div>

}



</div>

);

}





function Card({title,value}){


return (

<div className="
bg-slate-800
rounded-xl
p-6
border
border-slate-700
">


<h2 className="
text-lg
">

{title}

</h2>


<p className="
text-4xl
font-bold
mt-3
text-blue-400
">

{value}

</p>


</div>

);


}