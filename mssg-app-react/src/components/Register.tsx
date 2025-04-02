import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterProps } from './types/register';
import { sendPostRequest } from './utils';
import axios from 'axios';
import './Register.css';

const Register = ({ registerEndpoint }: RegisterProps) => {
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

  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const userData = { username: username, password: password };
    try {
      const data = await sendPostRequest(registerEndpoint, userData);
      console.log(data);
      navigate('/login');
    } catch (error: any) {
      console.log(error.data);
    }
  };
  return (
    <div className="register-wrapper">
      <form className="register-form" onSubmit={handleSubmit}>
        <label htmlFor="register-username">Username</label>
        <input type="text" id="register-username" value={username} onChange={updateUsername} />
        <label htmlFor="register-password">Password</label>
        <input type="password" id="register-password" value={password} onChange={updatePassword} />
        <input type="submit" />
      </form>
    </div>
  );
};

export default Register;
