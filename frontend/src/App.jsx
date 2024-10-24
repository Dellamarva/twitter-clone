import { Route, Routes } from 'react-router-dom';

//Pages
import HomePage from './pages/home/HomePage.jsx';
import LoginPage from './pages/auth/login/LoginPage.jsx';
import SignUpPage from './pages/auth/signup/SignUpPage.jsx';
import NotificationPage from './pages/notification/NotificationPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';

//Components
import Sidebar from './components/common/Sidebar.jsx';
import RightPanel from './components/common/RightPanel.jsx';

function App() {

  return (
    <div className='flex max-w-6xl mx-auto'>
      {/* Common Componenet because it is not wrapped with Routes */}
      <Sidebar /> 
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path='/notifications' element={<NotificationPage />} />
        <Route path='/profile/:username' element={<ProfilePage />} />
      </Routes>
      <RightPanel />
    </div>
  )
}

export default App
