import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginProps } from '../types';
import { sendPostRequest } from '../utils';
import { UserLoginResponse } from '../types/responses';
import './Login.css';

const Login = ({ loginEndpoint }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getCsrfToken = async () => {
      const response = await axios.get('http://localhost:8000/user/get-csrf-token/', {
        withCredentials: true,
      });
      console.log(response.data);
    };
    getCsrfToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userData = { username: username, password: password };
    try {
      const data = await sendPostRequest<UserLoginResponse>(loginEndpoint, userData);
      localStorage.setItem('username', data.username);
      localStorage.setItem('profile_pic', data.profile_pic);
      navigate('/message');
    } catch (error: any) {
      console.error(error.data);
    }
  };

  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <div className="login-wrapper">
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="login-username">Username</label>
        <input type="text" id="login-username" value={username} onChange={updateUsername} />
        <label htmlFor="login-password">Password</label>
        <input type="password" id="login-password" value={password} onChange={updatePassword} />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Login;
