import { useState } from "react";
import QRCode from "react-qr-code";

import {
  Copy,
  Check,
  QrCode,
  KeyRound,
  Router,
  RefreshCw,
  Download,
} from "lucide-react";

import api from "../api/axios";


export default function GenerateGateway() {


  const [loading, setLoading] = useState(false);

  const [gateway, setGateway] = useState(null);

  const [copied, setCopied] = useState("");




  // ================================
  // GENERATE GATEWAY
  // ================================
  const handleGenerate = async()=>{


    try{


      setLoading(true);



      const res =
        await api.post(
          "/gateway/generate"
        );



      setGateway(
        res.data.data
      );



    }
    catch(err){


      console.log(
        "Gateway generation error:",
        err.response?.data || err.message
      );



      alert(
        err.response?.data?.message ||
        "Failed to generate gateway credentials"
      );


    }
    finally{


      setLoading(false);


    }


  };





  // ================================
  // COPY TEXT
  // ================================
  const copyText = async(value,type)=>{


    await navigator.clipboard.writeText(
      value
    );


    setCopied(type);



    setTimeout(()=>{

      setCopied("");

    },2000);


  };






  // ================================
  // DOWNLOAD PDF
  // ================================
  const downloadPDF = async()=>{

try{


const response =
await api.get(

`/gateway/${gateway._id}/pdf`,

{
responseType:"blob"
}

);



const url =
window.URL.createObjectURL(
response.data
);



const link =
document.createElement("a");


link.href=url;


link.download =
`${gateway.gatewayId}.pdf`;


link.click();


}
catch(err){

console.log(err);

alert(
"PDF download failed"
);

}

};





 const qrData = gateway
? JSON.stringify({

gatewayId:
gateway.gatewayId,

qrToken:
gateway.qrToken

})
:"";





return (

<div
className="
w-full
space-y-6
p-3
sm:p-5
lg:p-8
"
>


{/* HEADER */}

<div
className="
flex
flex-col
gap-4
sm:flex-row
sm:items-center
sm:justify-between
"
>


<div>


<h1
className="
text-2xl
sm:text-3xl
font-bold
text-white
"
>

Gateway Credentials Generator

</h1>


<p
className="
text-slate-400
text-sm
mt-1
"
>

Generate secure ANTIMATE Gateway identity

</p>


</div>





<button

onClick={handleGenerate}

disabled={loading}

className="
flex
items-center
justify-center
gap-2
px-5
py-3
rounded-xl
bg-gradient-to-r
from-blue-500
to-cyan-500
hover:from-blue-600
hover:to-cyan-600
disabled:opacity-50
transition
font-semibold
shadow-lg
"

>


<RefreshCw

size={18}

className={
loading
?
"animate-spin"
:
""
}

/>



{

loading

?

"Generating..."

:

"Generate Gateway"

}


</button>



</div>





{
gateway && (


<div
className="
grid
grid-cols-1
lg:grid-cols-2
gap-6
"
>



{/* INFORMATION */}

<div
className="
bg-slate-900/60
border
border-white/10
rounded-2xl
p-5
space-y-5
"
>


<h2
className="
text-lg
font-semibold
flex
items-center
gap-2
text-blue-400
"
>


<Router size={20}/>


Gateway Information


</h2>





<CredentialBox

title="Gateway ID"

value={gateway.gatewayId}

type="id"

copyText={copyText}

copied={copied}

/>





<CredentialBox

title="Gateway Default Key"

value={gateway.defaultKey}

type="key"

copyText={copyText}

copied={copied}

/>





<div>


<p
className="
text-sm
text-blue-400
font-medium
"
>

Status

</p>



<span
className="
inline-block
mt-2
px-3
py-1
rounded-full
bg-green-500/20
text-green-400
text-sm
"
>

READY

</span>


</div>





</div>







{/* QR */}

<div

className="
bg-slate-900/60
border
border-white/10
rounded-2xl
p-5
flex
flex-col
items-center
justify-center
gap-4
"

>


<div
className="
flex
items-center
gap-2
font-semibold
text-blue-400
"
>


<QrCode size={20}/>


QR Token


</div>





<div
className="
bg-white
p-5
rounded-xl
"
>


<QRCode

value={qrData}

size={190}

/>


</div>





<p
className="
text-xs
text-slate-400
text-center
"
>

Scan this QR code to provision gateway.

</p>





<button
  onClick={downloadPDF}
  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:scale-95"
>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
  Download PDF
</button>


</div>



</div>


)

}






{
!gateway && (


<div

className="
border
border-dashed
border-white/10
rounded-2xl
p-10
text-center
text-slate-400
"

>


<KeyRound

size={40}

className="
mx-auto
mb-3
text-blue-400
"

/>


<p>

Click Generate Gateway to create credentials

</p>


</div>


)

}



</div>


);

}







function CredentialBox({

title,

value,

type,

copyText,

copied

}){


return (

<div>


<p

className="
text-sm
text-blue-400
font-medium
"

>

{title}

</p>





<div

className="
mt-2
flex
items-center
justify-between
gap-3
bg-black/30
rounded-lg
px-4
py-3
"

>


<span

className="
font-mono
font-semibold
break-all
text-white
"

>

{value}

</span>





<button

onClick={()=>copyText(value,type)}

className="
text-blue-400
hover:text-blue-300
"

>


{

copied===type

?

<Check size={18}/>

:

<Copy size={18}/>

}


</button>




</div>



</div>


);


}