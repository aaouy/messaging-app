import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const getCsrfUrl = "http://localhost:8000/user/get-csrf-token/";
        const response = await fetch(getCsrfUrl, {
          method: "GET",
          credentials: 'include'
        })

        if (!response.ok)
          throw new Error("CSRF token could not be fetch from the browser!");

      } catch (error) {
        console.error(error);
      }

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
    const registerUrl = "http://localhost:8000/user/register/";
    try {

      const userData = { username: username, password: password };
      const csrfCookie = getCookie('csrftoken');
      if (!csrfCookie)
        throw new Error("CSRF cookie was not able to be fetched from the browser!");

      const response = await fetch(registerUrl, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfCookie
        },
        body: JSON.stringify(userData)
      })

      const data = await response.json();
      console.log(data);
      navigate('/login');

    } catch (error: any) {
      console.log(error);
    }
  };
  return (
    <div className="flex w-[100vw] h-[100vh] items-center justify-center">
      <form className="flex items-center flex-col w-[30vw] p-[3%] border border-black" onSubmit={handleSubmit}>
        <label className="text-black mt-[5px] mb-[5px]" htmlFor="login-username">Username</label>
        <input className="text-black mt-[10px] w-2/3 border border-0.5 rounded-lg mb-[10px] p-1 outline-none" type="text" id="login-username" value={username} onChange={updateUsername} />
        <label className="text-black mt-[5px] mb-[5px]" htmlFor="login-password">Password</label>
        <input className="text-black mt-[10px] w-2/3 border border-0.5 mb-[10px] rounded-lg p-1 outline-none" type="password" id="login-password" value={password} onChange={updatePassword} />
        <input className="text-white mt-[20px] mb-[10px] bg-black w-1/2 cursor-pointer" type="submit" />
      </form>
    </div>
  );
};

export default Register;
