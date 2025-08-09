import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../firebaseConfig.js";


interface IUserAuthProviderProps {
  children : React.ReactNode;
}

type AuthContextData = {
  user: User | null;
  logIn: typeof logIn;
  signUp: typeof signUp;
  logOut: typeof logOut;
  googleSignIn: typeof googleSignIn;
};

const logIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

const signUp = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

const logOut = () => {
  signOut(auth);
};

const googleSignIn = () => {
  const googleAuthProvider = new GoogleAuthProvider();
  googleAuthProvider.setCustomParameters({
    prompt: "select_account",
  });
  return signInWithPopup(auth, googleAuthProvider);
};


//initial value of the context
export const userAuthContext = createContext<AuthContextData>({
  user: null,
  logIn,
  signUp,
  logOut,
  googleSignIn,
});

//context provider
export const UserAuthProvider: React.FunctionComponent<
  IUserAuthProviderProps
> = ({children}) => {
    
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if(user) {
          console.log("The logged in user state is : ", user);
          setUser(user);
        } else {
          setUser(null);
        }
      });
      
      return () => {
        unsubscribe();
      };
    }, []);

    const value: AuthContextData = {
      user,
      logIn,
      signUp,
      logOut,
      googleSignIn,
    };

    return(
      <userAuthContext.Provider value={value}>{children}</userAuthContext.Provider>
    )
};

//can use this hook to access the context. can destructure the values we want: login, signup, etc.
export const useUserAuth = () => {
  return useContext(userAuthContext);
};