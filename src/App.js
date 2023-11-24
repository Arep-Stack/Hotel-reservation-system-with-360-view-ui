import { useEffect, useState } from 'react';

import { Routes, Route, useNavigate } from 'react-router-dom';

import { getUser } from './utils/user';

import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import Home from './pages/Home/Home';
import Services from './pages/Services/Services';
import Rooms from './pages/Rooms/Rooms';
import User from './pages/User/User';
import About from './pages/About/About';
import Login from './pages/Login/Login';
import SignUp from './pages/SignUp/SignUp';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [user, setUser] = useState(null);

  const navigator = useNavigate();

  useEffect(() => {
    const userData = getUser();

    if (userData) {
      setUser(userData);
      navigator('/User'); // Change when useContext is used
    }
  }, [navigator, user]);

  return (
    <div style={{ position: 'relative' }}>
      <Navbar />
      <ToastContainer style={{ marginTop: 80 }} />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/Home" element={<Home />}></Route>
        <Route path="/Services" element={<Services />}></Route>
        <Route path="Services/Rooms" element={<Rooms />}></Route>
        <Route path="/User" element={<User />}></Route>
        <Route path="/About" element={<About />}></Route>
        <Route path="/Login" element={<Login />}></Route>
        <Route path="/SignUp" element={<SignUp />}></Route>
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
