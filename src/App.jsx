import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Settings from './components/Settings';
import Main from './components/Main';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const App = () => {
  
    return (
      <Router>
        <ToastContainer />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/main" element={<Main />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    );
  };
  

export default App;
