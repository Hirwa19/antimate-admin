import { useEffect, useState } from "react";
import api from "../api/axios";


export default function Devices(){


const [devices,setDevices]=useState([]);

const [loading,setLoading]=useState(false);





useEffect(()=>{

loadDevices();

},[]);





async function loadDevices(){

try{


const res =
await api.get("/devices/my-devices");


console.log(
"DEVICES:",
res.data
);


setDevices(res.data);



}
catch(error){

console.log(
"LOAD DEVICES ERROR:",
error
);

}


}







async function generateDevice(){


try{


setLoading(true);



const res =
await api.post(
"/devices/register"
);



console.log(
"NEW DEVICE:",
res.data
);



alert(
"Device generated successfully"
);



loadDevices();



}
catch(error){


console.log(
"GENERATE DEVICE ERROR:",
error.response?.data
);



alert(
"Device creation failed"
);


}

finally{

setLoading(false);

}


}








return (

<div className="min-h-screen bg-slate-950 text-white p-10">



<h1 className="text-3xl font-bold mb-8">

ANTIMATE DEVICES

</h1>





<button

onClick={generateDevice}

className="bg-blue-600 px-6 py-3 rounded mb-10"

>

{

loading ?

"Generating..." :

"Generate New Device"

}


</button>








<table className="w-full bg-white/10">


<thead>

<tr>


<th className="p-3">

Device ID

</th>


<th>

Status

</th>


<th>

Owner

</th>


<th>

Label

</th>


</tr>


</thead>





<tbody>


{

devices.map(device=>(


<tr key={device._id}>


<td className="p-3">

{device.deviceId}

</td>


<td>

{device.activationStatus}

</td>


<td>

{
device.owner || "Not assigned"
}

</td>



<td>


<a

href={

`${
import.meta.env.VITE_API_URL
}/api/devices/label/${device.deviceId}`

}

target="_blank"

className="text-blue-400"

>

PDF

</a>


</td>


</tr>


))


}



</tbody>


</table>





</div>

);


}