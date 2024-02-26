import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
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

export const GlobalContext = createContext();

function App() {
  //CONTEXT - USER
  const [allUsers, setAllUsers] = useState([]);
  const [allUsersError, setAllUsersError] = useState(null);
  const [allUsersLoading, setAllUsersLoading] = useState(false);

  //current user
  const [user, setUser] = useState(null);

  //navigation
  const navigator = useNavigate();
  const location = useLocation();

  //function
  const getAllUsers = () => {
    setAllUsersLoading(true);

    axios({
      method: 'GET',
      url: '/users',
    })
      .then(({ data }) => setAllUsers(data))
      .catch(() => setAllUsersError('Error getting users'))
      .finally(() => setAllUsersLoading(false));
  };

  useEffect(() => {
    const userData = getUser();

    if (userData) {
      setUser(userData);
      navigator('/User');
    }

    getAllUsers();
  }, [navigator, user]);

  const contextValues = {
    getAllUsers,
    allUsers,
    allUsersError,
    allUsersLoading,
  };

  return (
    <GlobalContext.Provider value={contextValues}>
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
        {location.pathname !== '/User' && <Footer />}
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
