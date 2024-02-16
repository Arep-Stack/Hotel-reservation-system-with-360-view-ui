import { useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import About from './pages/About/About';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Rooms from './pages/Rooms/Rooms';
import Services from './pages/Services/Services';
import SignUp from './pages/SignUp/SignUp';
import User from './pages/User/User';
import { getUser } from './utils/user';

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
      <ToastContainer />
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
