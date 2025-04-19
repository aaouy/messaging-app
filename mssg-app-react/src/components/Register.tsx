import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterProps } from './types/register';
import { sendPostRequest } from './utils';
import axios from 'axios';

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
      navigate('/login');
    } catch (error: any) {
      console.log(error);
    }
  };
  return (
    <div className="flex w-[100vw] h-[100vh] items-center justify-center">
      <form className="flex items-center flex-col w-[30vw] p-[3%] border border-white" onSubmit={handleSubmit}>
        <label className="text-white mt-[5px] mb-[5px]" htmlFor="login-username">Username</label>
        <input className="text-white mt-[10px] w-2/3 bg-[#424549] rounded-lg mb-[10px] p-1 outline-none" type="text" id="login-username" value={username} onChange={updateUsername} />
        <label className="text-white mt-[5px] mb-[5px]" htmlFor="login-password">Password</label>
        <input className="text-white mt-[10px] w-2/3 mb-[10px] bg-[#424549] rounded-lg p-1 outline-none" type="password" id="login-password" value={password} onChange={updatePassword} />
        <input className="text-white mt-[20px] mb-[10px] bg-[#7289da] w-1/2 cursor-pointer" type="submit" />
      </form>
    </div>
  );
};

export default Register;
