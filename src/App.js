import axios from 'axios';
import { createContext, useEffect, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Footer from './components/Footer/Footer';
import Navbar from './components/Navbar/Navbar';
import About from './pages/About/About';
import PaypalCallback from './pages/Callbacks/PaypalCallback';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Pavilions from './pages/Pavilions/Pavilions';
import Pools from './pages/Pools/Pools';
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
  const [allUsersLoading, setAllUsersLoading] = useState(true);

  //CONTEXT - RESERVATION
  const [allReservations, setAllReservations] = useState([]);
  const [allReservationsError, setAllReservationsError] = useState(null);
  const [allReservationsLoading, setAllReservationsLoading] = useState(true);

  //CONTEXT - SERVICES
  const [allServices, setAllServices] = useState([]);
  const [allServicesError, setAllServicesError] = useState(null);
  const [allServicesLoading, setAllServicesLoading] = useState(true);

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

  const getAllReservations = () => {
    setAllReservationsLoading(true);

    axios({
      method: 'GET',
      url: '/reservations',
    })
      .then(({ data }) => setAllReservations(data))
      .catch(() => setAllReservationsError('Error getting reservations'))
      .finally(() => setAllReservationsLoading(false));
  };

  const getAllServices = () => {
    setAllServicesLoading(true);

    axios({
      method: 'GET',
      url: '/services',
    })
      .then(({ data }) => setAllServices(data))
      .catch(() => setAllServicesError('Error getting services'))
      .finally(() => setAllServicesLoading(false));
  };

  useEffect(() => {
    const userData = getUser();

    if (userData) {
      setUser(userData);
      if (location.pathname !== '/Paypal-Callback') navigator('/User');
    }

    getAllUsers();
    getAllReservations();
    getAllServices();
  }, [navigator, user]);

  const contextValues = {
    getAllUsers,
    allUsers,
    allUsersError,
    allUsersLoading,
    getAllReservations,
    allReservations,
    allReservationsError,
    allReservationsLoading,
    getAllServices,
    allServices,
    allServicesError,
    allServicesLoading,
  };

  return (
    <GlobalContext.Provider value={contextValues}>
      <div style={{ position: 'relative' }}>
        {location.pathname !== '/Paypal-Callback' && <Navbar />}
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/Home" element={<Home />}></Route>
          <Route path="/Services" element={<Services />}></Route>
          <Route path="Services/Rooms" element={<Rooms />}></Route>
          <Route path="Services/Pavilions" element={<Pavilions />}></Route>
          <Route path="Services/Pools" element={<Pools />}></Route>
          <Route path="/User" element={<User />}></Route>
          <Route path="/About" element={<About />}></Route>
          <Route path="/Login" element={<Login />}></Route>
          <Route path="/SignUp" element={<SignUp />}></Route>
          <Route path="/Paypal-Callback" element={<PaypalCallback />}></Route>
        </Routes>
        {location.pathname !== '/User' && <Footer />}
      </div>
    </GlobalContext.Provider>
  );
}

export default App;
