import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ChatPage from './components/ChatPage/ChatPage';
import Login from './components/Login/Login';
import Register from './components/Register/Register';

function App() {
  return (
      <Router>
      <Routes>
        <Route
          path="/register"
          element={<Register registerEndpoint="http://localhost:8000/user/register/" />}
        ></Route>
        <Route
          path="/login"
          element={<Login loginEndpoint="http://localhost:8000/user/login/" />}
        ></Route>
        <Route path="/message" element={<ChatPage />}></Route>
        <Route path="/message/:chatroom_id" element={<ChatPage />}></Route>
      </Routes>
    </Router>

  );
}

export default App;
