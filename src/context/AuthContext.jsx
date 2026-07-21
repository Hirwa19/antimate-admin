import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";


const AuthContext = createContext();



export function AuthProvider({children}){


const [admin,setAdmin] = useState(null);

const [token,setToken] = useState(null);

const [loading,setLoading] = useState(true);




// LOAD SAVED LOGIN

useEffect(()=>{


const savedAdmin =
localStorage.getItem("admin");


const savedToken =
localStorage.getItem("token");



if(savedAdmin && savedToken){

setAdmin(
JSON.parse(savedAdmin)
);

setToken(savedToken);

}



setLoading(false);



},[]);







// LOGIN

const login = (adminData, jwtToken)=>{


console.log(
"AUTH LOGIN DATA:",
adminData
);


localStorage.setItem(
"admin",
JSON.stringify(adminData)
);


localStorage.setItem(
"token",
jwtToken
);



setAdmin(adminData);

setToken(jwtToken);


};






// LOGOUT

const logout = ()=>{


localStorage.removeItem("admin");

localStorage.removeItem("token");


setAdmin(null);

setToken(null);


};







return (

<AuthContext.Provider

value={{

admin,

token,

login,

logout,

loading

}}

>

{children}

</AuthContext.Provider>


);


}





export function useAuth(){

return useContext(AuthContext);

}