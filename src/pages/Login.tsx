import { useEffect, useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useUserAuth } from "../context/userAuthContext";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { googleSignIn, user } = useUserAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (user?.email) {
        try {
          const res = await fetch(
            `https://asia-southeast1-petcare-essentials.cloudfunctions.net/getUserInfo?email=${encodeURIComponent(user.email)}`,
            { method: "GET", mode: "cors" }
          );

          if (!res.ok) throw new Error("Failed to fetch user info");

          const data = await res.json();

          switch (data.role) {
            case "Data Team":
              return navigate("/data team/homepage");
            case "Team Lead":
              return navigate("/team lead/homepage");
            default:
              return navigate("/profile");
          }
        } catch (error) {
          console.error("Auto-redirect failed:", error);
        }
      }
      setIsChecking(false);
    };

    checkAndRedirect();
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await googleSignIn();
      const currentUser = getAuth().currentUser;
      if (!currentUser?.email) throw new Error("No user email after sign-in");

      const res = await fetch(
        `https://asia-southeast1-petcare-essentials.cloudfunctions.net/getUserInfo?email=${encodeURIComponent(currentUser.email)}`,
        { method: "GET", mode: "cors" }
      );

      if (!res.ok) throw new Error("Failed to fetch user info");
      const data = await res.json();

      switch (data.role) {
        case "Data Team":
          return navigate("/data team/homepage");
        case "Team Lead":
          return navigate("/team lead/homepage");
        default:
          return navigate("/profile");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // Email/password login logic would go here
    console.log("Email login attempted:", email);
  };

  if (isChecking) return (
    <div className="flex justify-center items-center h-screen text-lg">
      Loading...
    </div>
  );

  return (
    <div 
      className="flex min-h-screen w-full overflow-hidden"
    >
      {/* Left Side - Illustration and Description */}
      <div 
        className="w-1/2 bg-gray-600 flex flex-col items-center justify-center px-16 py-12"
        style={{ 
          width: '50%', 
          backgroundColor: '#4a5568', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          padding: '3rem'
        }}
      >
        {/* Illustration Container */}
        <div className="relative mb-12" style={{ marginBottom: '3rem' }}>
          {/* Main organic blob background */}
          <div 
            className="w-96 h-80 bg-gradient-to-br from-gray-100 to-gray-200 relative"
            style={{
              width: '24rem',
              height: '20rem',
              background: 'linear-gradient(to bottom right, #f7fafc, #e2e8f0)',
              borderRadius: '120px 80px 140px 60px / 80px 120px 60px 100px',
              transform: 'rotate(-5deg)',
              position: 'relative'
            }}
          >
            {/* Dashboard/Computer illustration */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}
            >
              <div 
                className="w-72 h-48 bg-white rounded-2xl shadow-xl p-6 transform rotate-2 relative overflow-hidden"
                style={{
                  width: '18rem',
                  height: '12rem',
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  padding: '1.5rem',
                  transform: 'rotate(2deg)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Browser-like header */}
                <div 
                  className="flex items-center gap-2 mb-4"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}
                >
                  <div 
                    className="w-3 h-3 bg-red-400 rounded-full"
                    style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#f87171', borderRadius: '50%' }}
                  ></div>
                  <div 
                    className="w-3 h-3 bg-yellow-400 rounded-full"
                    style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#facc15', borderRadius: '50%' }}
                  ></div>
                  <div 
                    className="w-3 h-3 bg-green-400 rounded-full"
                    style={{ width: '0.75rem', height: '0.75rem', backgroundColor: '#4ade80', borderRadius: '50%' }}
                  ></div>
                  <div 
                    className="flex-1 bg-gray-100 h-2 rounded ml-4"
                    style={{ flex: 1, backgroundColor: '#f3f4f6', height: '0.5rem', borderRadius: '0.25rem', marginLeft: '1rem' }}
                  ></div>
                </div>
                
                {/* Chart/Dashboard content */}
                <div 
                  className="grid grid-cols-2 gap-3 mb-4"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}
                >
                  <div 
                    className="h-16 bg-blue-400 rounded-lg opacity-90"
                    style={{ height: '4rem', backgroundColor: '#60a5fa', borderRadius: '0.5rem', opacity: 0.9 }}
                  ></div>
                  <div 
                    className="h-16 bg-green-400 rounded-lg opacity-90"
                    style={{ height: '4rem', backgroundColor: '#4ade80', borderRadius: '0.5rem', opacity: 0.9 }}
                  ></div>
                </div>
                
                <div 
                  className="grid grid-cols-3 gap-2"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}
                >
                  <div 
                    className="h-8 bg-orange-400 rounded opacity-90"
                    style={{ height: '2rem', backgroundColor: '#fb923c', borderRadius: '0.25rem', opacity: 0.9 }}
                  ></div>
                  <div 
                    className="h-8 bg-purple-400 rounded opacity-90"
                    style={{ height: '2rem', backgroundColor: '#c084fc', borderRadius: '0.25rem', opacity: 0.9 }}
                  ></div>
                  <div 
                    className="h-8 bg-pink-400 rounded opacity-90"
                    style={{ height: '2rem', backgroundColor: '#f472b6', borderRadius: '0.25rem', opacity: 0.9 }}
                  ></div>
                </div>
                
                {/* Floating user avatars */}
                <div 
                  className="absolute -bottom-2 -left-2 w-12 h-12 bg-blue-500 rounded-full border-4 border-white shadow-lg"
                  style={{ 
                    position: 'absolute', 
                    bottom: '-0.5rem', 
                    left: '-0.5rem', 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#3b82f6', 
                    borderRadius: '50%', 
                    border: '4px solid white', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                ></div>
                <div 
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-orange-500 rounded-full border-4 border-white shadow-lg"
                  style={{ 
                    position: 'absolute', 
                    bottom: '-0.5rem', 
                    right: '-0.5rem', 
                    width: '3rem', 
                    height: '3rem', 
                    backgroundColor: '#f97316', 
                    borderRadius: '50%', 
                    border: '4px solid white', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                ></div>
              </div>
            </div>
            
            {/* Floating decorative elements */}
            <div 
              className="absolute -top-4 -left-4 w-8 h-8 bg-blue-400 rounded-full opacity-80"
              style={{ 
                position: 'absolute', 
                top: '-1rem', 
                left: '-1rem', 
                width: '2rem', 
                height: '2rem', 
                backgroundColor: '#60a5fa', 
                borderRadius: '50%', 
                opacity: 0.8 
              }}
            ></div>
            <div 
              className="absolute -top-2 -right-6 w-6 h-6 bg-green-400 rounded-full opacity-80"
              style={{ 
                position: 'absolute', 
                top: '-0.5rem', 
                right: '-1.5rem', 
                width: '1.5rem', 
                height: '1.5rem', 
                backgroundColor: '#4ade80', 
                borderRadius: '50%', 
                opacity: 0.8 
              }}
            ></div>
            <div 
              className="absolute -bottom-6 -left-8 w-10 h-10 bg-purple-400 rounded-full opacity-80"
              style={{ 
                position: 'absolute', 
                bottom: '-1.5rem', 
                left: '-2rem', 
                width: '2.5rem', 
                height: '2.5rem', 
                backgroundColor: '#c084fc', 
                borderRadius: '50%', 
                opacity: 0.8 
              }}
            ></div>
          </div>
        </div>

        {/* Description Text */}
        <div 
          className="text-center max-w-lg px-8"
          style={{ textAlign: 'center', maxWidth: '32rem', padding: '0 2rem' }}
        >
          <p 
            className="text-white text-lg leading-relaxed font-light"
            style={{ color: 'white', fontSize: '1.125rem', lineHeight: '1.75', fontWeight: '300' }}
          >
            Unifying enterprise systems, compliance protocols, and performance insights into a single strategic AI hub
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div 
        className="w-1/2 bg-white flex items-center justify-center"
        style={{ 
          width: '50%', 
          backgroundColor: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}
      >
        <div 
          className="w-full max-w-sm px-8"
          style={{ width: '100%', maxWidth: '24rem', padding: '0 2rem' }}
        >
          {/* Header */}
          <div 
            className="text-center mb-8"
            style={{ textAlign: 'center', marginBottom: '2rem' }}
          >
            <h1 
              className="text-lg font-normal text-black mb-1"
              style={{ fontSize: '1.125rem', fontWeight: '400', color: 'black', marginBottom: '0.25rem' }}
            >
              Welcome back to
            </h1>
            <h2 
              className="text-3xl font-bold text-black"
              style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'black' }}
            >
              SyncMate!
            </h2>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4 mb-6" style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label 
                className="block text-sm font-medium text-black mb-2"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'black', marginBottom: '0.5rem' }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label 
                className="block text-sm font-medium text-black mb-2"
                style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: 'black', marginBottom: '0.5rem' }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gray-700 text-white rounded-lg text-base font-medium transition-colors hover:bg-gray-800 mt-6"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#374151',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                marginTop: '1.5rem'
              }}
            >
              Log In
            </button>
          </form>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 bg-white text-gray-700 border border-gray-300 rounded-lg text-base font-medium flex items-center justify-center gap-3 transition-all hover:bg-gray-50 hover:border-gray-400"
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: 'white',
              color: '#374151',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem'
            }}
          >
            <FcGoogle style={{ fontSize: '1.25rem' }} />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
