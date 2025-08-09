import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { UserAuthProvider } from './context/userAuthContext'
import Login from './pages/Login'
import './App.css'
import { useState, useEffect } from 'react'

function App() {
  console.log('App component rendering');
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  
  useEffect(() => {
    // Test Firebase configuration on app load
    try {
      import('./firebaseConfig.js');
    } catch (error) {
      console.error('Firebase configuration error:', error);
      setFirebaseError(error instanceof Error ? error.message : 'Firebase configuration error');
    }
  }, []);

  if (firebaseError) {
    return (
      <div style={{
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1 style={{color: 'red', marginBottom: '20px'}}>Firebase Configuration Error</h1>
        <p style={{marginBottom: '20px'}}>
          Your Firebase configuration is missing or invalid. Please follow these steps:
        </p>
        <ol style={{marginBottom: '20px', lineHeight: '1.6'}}>
          <li>Create a <code>.env</code> file in your project root</li>
          <li>Add your Firebase configuration variables:</li>
        </ol>
        <pre style={{
          backgroundColor: '#f5f5f5',
          padding: '15px',
          borderRadius: '5px',
          overflow: 'auto'
        }}>
{`VITE_APIKEY=your-api-key-here
VITE_AUTHDOMAIN=your-project-id.firebaseapp.com
VITE_PROJECTID=your-project-id
VITE_STORAGEBUCKET=your-project-id.appspot.com
VITE_MESSAGESENDERID=your-sender-id
VITE_APPID=your-app-id`}
        </pre>
        <p style={{marginTop: '20px'}}>
          Get these values from your Firebase Console → Project Settings → General → Your apps
        </p>
        <details style={{marginTop: '20px'}}>
          <summary>Error Details</summary>
          <pre style={{color: 'red', marginTop: '10px'}}>{firebaseError}</pre>
        </details>
      </div>
    );
  }
  
  return (
    <UserAuthProvider>
      <Router>
        <div className="App" style={{minHeight: '100vh', width: '100vw'}}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            {/* Add more routes here as needed */}
            <Route path="/data team/homepage" element={<div style={{padding: '20px'}}>Data Team Homepage</div>} />
            <Route path="/team lead/homepage" element={<div style={{padding: '20px'}}>Team Lead Homepage</div>} />
            <Route path="/profile" element={<div style={{padding: '20px'}}>Profile Page</div>} />
          </Routes>
        </div>
      </Router>
    </UserAuthProvider>
  )
}

export default App