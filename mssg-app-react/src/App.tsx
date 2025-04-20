import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './components/ChatPage';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  return (
      <Router>
      <Routes>
        <Route
          path="/register"
          element={<Register/>}
        ></Route>
        <Route
          path="/login"
          element={<Login />}
        ></Route>
        <Route path="/message" element={<ChatPage />}></Route>
        <Route path="/message/:selectedChatRoom" element={<ChatPage />}></Route>
      </Routes>
    </Router>

  );
}

export default App;
