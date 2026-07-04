import {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";


const AuthContext = createContext();


export function AuthProvider({ children }) {


  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("token")
  );



  const login = (userData, accessToken) => {

    localStorage.setItem(
      "token",
      accessToken
    );


    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    setToken(accessToken);

    setUser(userData);

  };



  const logout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");


    setToken(null);

    setUser(null);

  };



  useEffect(()=>{

    const savedUser =
      localStorage.getItem("user");


    if(savedUser){

      setUser(
        JSON.parse(savedUser)
      );

    }

  },[]);



  return (

    <AuthContext.Provider

      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token
      }}

    >

      {children}

    </AuthContext.Provider>

  );

}



export function useAuth(){

  return useContext(AuthContext);

}