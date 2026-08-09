import { useEffect, useState } from "react";
import api from "../api/axios";


export default function Workers(){

const [workers,setWorkers]=useState([]);

const [loading,setLoading]=useState(true);



const loadWorkers = async()=>{

try{

const res =
await api.get("/workers");

console.log(
"WORKERS:",
res.data
);


setWorkers(res.data);


}
catch(err){

console.log(
"LOAD WORKERS ERROR:",
err
);

}
finally{

setLoading(false);

}

};



useEffect(()=>{

loadWorkers();

},[]);





const deleteWorker = async(id)=>{


if(!confirm("Delete this worker?"))
return;


try{

await api.delete(
`/workers/${id}`
);


loadWorkers();


}
catch(err){

console.log(err);

}


};




return (

<div className="
p-8
text-white
">


<h1 className="
text-3xl
font-bold
mb-6
">

ANTIMATE STAFF

</h1>




{loading && (

<p>
Loading workers...
</p>

)}





<div className="
grid
gap-4
">


{
workers.map(worker=>(


<div

key={worker._id}

className="
bg-slate-800
p-5
rounded-xl
border
border-slate-700
"

>


<h2 className="
text-xl
font-bold
">

{worker.fullName}

</h2>



<p>
Email:
{worker.email}
</p>


<p>
Phone:
{worker.phone}
</p>


<p>
Role:
<span className="text-blue-400">
{worker.role}
</span>
</p>



<button

onClick={()=>deleteWorker(worker._id)}

className="
mt-3
bg-red-500
px-4
py-2
rounded-lg
"

>

Delete

</button>


</div>


))

}



</div>


</div>


);

}