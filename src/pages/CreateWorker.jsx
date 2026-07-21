import {useState} from "react";
import api from "../api/axios";


export default function CreateWorker(){


const [form,setForm]=useState({});


const submit=async()=>{


try{


const res =
await api.post(
"/workers",
form
);


console.log(
"CREATED:",
res.data
);


alert(
"Worker created"
);


}
catch(err){

console.log(err);

alert(
err.response?.data?.message ||
"Failed"
);

}


};



return (

<div className="
p-8
text-white
">


<h1 className="
text-3xl
mb-6
">

Create Worker

</h1>



{
[
"fullName",
"idNumber",
"phone",
"email",
"password",
"role"

].map(field=>(


<input

key={field}

className="
block
w-full
bg-slate-800
p-3
mb-3
rounded
"

placeholder={field}

onChange={
e=>
setForm({
...form,
[field]:e.target.value
})
}

/>


))

}



<button

onClick={submit}

className="
bg-blue-500
px-6
py-3
rounded
"

>

Create

</button>


</div>

);


}