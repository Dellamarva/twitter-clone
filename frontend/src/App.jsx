import { Route, Routes, Navigate } from 'react-router-dom';

//Pages
import HomePage from './pages/home/HomePage.jsx';
import LoginPage from './pages/auth/login/LoginPage.jsx';
import SignUpPage from './pages/auth/signup/SignUpPage.jsx';
import NotificationPage from './pages/notification/NotificationPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import LoadingSpinner from './components/common/LoadingSpinner.jsx';

//Components
import Sidebar from './components/common/Sidebar.jsx';
import RightPanel from './components/common/RightPanel.jsx';

//Error handler
import { Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

function App() {

  const { data:authUser, isLoading, error, isError } = useQuery({ //Gets the user being logged in
    queryKey: ['authUser'], //Give a unique name to the query and refer to it later (authUser)
    queryFn: async() => {
      try {
        const res = await fetch("/api/auth/me"); //Fetch the user
        const data = await res.json(); //Get the user in json format
				if (data.error) { //If the object is empty (logged out user)
					return null;
				}
        if (!res.ok) {
          throw new Error(data.error || "Failed to retrieve user");
        }
        console.log("authUser :", data);
        return data;
      } catch (error) {
        throw new Error(error);
      }
    },
    retry: false
  });

  if(isLoading) { //Loading spinner
    return (
      <div className='h-screen flex justify-center items-center'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {/* Common Componenet because it is not wrapped with Routes */}
      {authUser && <Sidebar />} {/* Display Sidebar when logged in */}
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
        <Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      {authUser && <RightPanel />} {/* Display Right Pannel when logged in */}
      <Toaster />
    </div>
  )
}

export default App
