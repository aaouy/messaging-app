import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils';
import { User } from '../types';
import { convertSnakeToCamel } from './utils';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/user/get-csrf-token/', {
          method: "GET",
          credentials: 'include'
        })
        
        if (!response.ok)
          throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
        
      } catch (error: any) {
        console.error(error);
      }

    };
    getCsrfToken();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const csrfCookie = getCookie("csrftoken");
      if (!csrfCookie)
        throw new Error("CSRF cookie could not be obtained from the browser!");

      const loginUrl = "http://localhost:8000/user/login/";
      const userData = { username: username, password: password };

      const response = await fetch(loginUrl, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfCookie,
        },
        body: JSON.stringify(userData)
      })
      
      if (!response.ok) {
        throw new Error(`Response failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const transformedData = convertSnakeToCamel(data);
      
      const loggedInUser: User = transformedData.user;
      console.log('Successfully logged in.');
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      navigate('/message');

    } catch (error: any) {
      console.error(error);
    }

  };

  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
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

export default Login;
