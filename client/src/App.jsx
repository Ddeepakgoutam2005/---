import './App.css';
import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Preloader from './components/Preloader.jsx';
import BackgroundAnimation from './components/BackgroundAnimation.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Ministers from './pages/Ministers.jsx';
import Promises from './pages/Promises.jsx';
import News from './pages/News.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import MinisterDetail from './pages/MinisterDetail.jsx';
import Admin from './pages/Admin.jsx';
import Auth from './pages/Auth.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminQueries from './pages/AdminQueries.jsx';
import MyQueries from './pages/MyQueries.jsx';
import Privacy from './pages/Privacy.jsx';
import Chatbot from './components/Chatbot.jsx';

export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 80 });
  }, []);

  const handlePreloaderComplete = () => {
    setLoading(false);
  };

  return (
    <>
      {loading && <Preloader onComplete={handlePreloaderComplete} />}
      <CustomCursor />
      <Disclaimer />
      <BackgroundAnimation />
      <Navbar />
      <main className="flex-grow relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ministers" element={<Ministers />} />
          <Route path="/ministers/:id" element={<MinisterDetail />} />
          <Route path="/promises" element={<Promises />} />
          <Route path="/news" element={<News />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<PrivateRoute role="admin"><Admin /></PrivateRoute>} />
          <Route path="/admin/queries" element={<PrivateRoute role="admin"><AdminQueries /></PrivateRoute>} />
          <Route path="/my/queries" element={<PrivateRoute role={null}><MyQueries /></PrivateRoute>} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </main>
      <Footer />
      <Chatbot />
    </>
  );
}
