import { BrowserRouter, Routes, Route } from 'react-router-dom';

//Styles
import './App.css';

//Pages
import Reservation from './pages/Reservation/Reservation';

//Components
import Home from './pages/Home/Home';
import Navbar from './components/Navbar/Navbar';

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/Home" element={<Home />}></Route>
          <Route path="/Reservation" element={<Reservation />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
