import './App.css';
import { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Dashboard from './pages/Dashboard.jsx';
import Ministers from './pages/Ministers.jsx';
import Promises from './pages/Promises.jsx';
import News from './pages/News.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Footer from './components/Footer.jsx';
import MinisterDetail from './pages/MinisterDetail.jsx';
import Admin from './pages/Admin.jsx';
import Privacy from './pages/Privacy.jsx';
import Auth from './pages/Auth.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminQueries from './pages/AdminQueries.jsx';
import MyQueries from './pages/MyQueries.jsx';

export default function App() {
  const navigate = useNavigate();
  useEffect(() => {
    AOS.init({ duration: 600, once: true, offset: 80 });
  }, []);
  return (
    <>
      <Navbar />
      <Hero onExploreMinisters={() => navigate('/ministers')} onViewAnalytics={() => navigate('/')} />
      <div className="container mx-auto px-4 mt-6">
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
      </div>
      <Footer />
    </>
  );
}
