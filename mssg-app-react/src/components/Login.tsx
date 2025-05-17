import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { convertSnakeToCamel, getCookie } from './utils';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loginSuccessful, setLoginSuccessful] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const response = await fetch('http://localhost:8000/user/get-csrf-token/', {
          method: 'GET',
          credentials: 'include',
        });

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
      const csrfCookie = getCookie('csrftoken');
      if (!csrfCookie) throw new Error('CSRF cookie could not be obtained from the browser!');

      setIsLoading(true);

      const loginUrl = 'http://localhost:8000/user/login/';
      const userData = { username: username, password: password };

      const response = await fetch(loginUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfCookie,
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      setIsLoading(false);
      setLoginSuccessful(true);

      const transformedData = convertSnakeToCamel(data);

      const loggedInUser: User = transformedData.user;
      console.log('Successfully logged in.');
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setTimeout(() => {
        navigate('/message');
      }, 1000);

    } catch (error: any) {
      console.error(error);
      setShowAlert(true);
    }
  };

  const closeAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowAlert(false);
  };

  const toRegister = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate('/register');
  };

  const updateUsername = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const updatePassword = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  return (
    <>
      {loginSuccessful && (
        <div
          className="bg-teal-100 fixed left-1/2 -translate-x-1/2 border-t-4 border-teal-500 rounded-b text-teal-900 px-4 py-3 shadow-md"
          role="alert"
        >
          <div className="flex">
            <div className="py-1">
              <svg
                className="fill-current h-6 w-6 text-teal-500 mr-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold">Login Sucessful!</p>
              <p className="text-sm">Enjoy your time.</p>
            </div>
          </div>
        </div>
      )}
      <div className="flex relative left-1/2 top-1/2 rounded-md -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border-1">
        <div className="flex flex-col text-white justify-center items-center w-1/2 h-full rounded-r-full bg-gray-400">
          <h1 className="text-center font-semibold text-4xl p-2">Hello, Welcome!</h1>
          <p className="text-center font-light p-4 mb-2">Don't have an account? </p>
          <button
            onClick={toRegister}
            className="py-1 rounded-md cursor-pointer hover:scale-102 font-medium px-10 border-1"
          >
            Register
          </button>
        </div>
        <div className="flex flex-col justify-center items-center w-1/2 py-15 px-2">
          <h1 className="text-2xl font-semibold mb-2">Login</h1>
          <div
            className={`${
              showAlert ? 'visible' : 'invisible'
            } bg-red-100 text-sm border relative border-red-400 w-3/4 text-red-700 px-1 py-3 rounded
          `}
            role="alert"
          >
            <span className="block sm:inline">Incorrect username or password.</span>
            <span className="absolute top-0 right-0 pr-2 py-3">
              <button onClick={closeAlert}>
                <svg
                  className="fill-current h-5 w-5 cursor-pointer hover:scale-120 text-red-500"
                  role="button"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <title>Close</title>
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
                </svg>
              </button>
            </span>
          </div>
          <form
            className="flex items-center justify-center flex-col w-full h-full p-[3%]"
            onSubmit={handleSubmit}
          >
            <input
              className="text-black mt-[15px] text-sm w-3/4 rounded-lg bg-[#f5f5f5] mb-[10px] p-2 outline-none"
              type="text"
              id="login-username"
              value={username}
              onChange={updateUsername}
              placeholder="Username"
            />
            <input
              className="text-black mt-[15px] w-3/4 text-sm mb-[10px] rounded-lg p-2 bg-[#f5f5f5] outline-none"
              type="password"
              id="login-password"
              value={password}
              onChange={updatePassword}
              placeholder="Password"
            />
            <button
              type="submit"
              className="hover:scale-101 flex items-center justify-center text-white text-md font-[450] mt-[20px] p-2.5 h-10 w-3/4 mb-[10px] bg-black cursor-pointer rounded-lg"
            >
              {isLoading ? (
                <>
                  <svg className="left-0 animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray="32"
                      strokeDashoffset="32"
                    >
                      <animate
                        attributeName="stroke-dasharray"
                        dur="2s"
                        values="0 32;16 16;0 32;0 32"
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        dur="2s"
                        values="0;-16;-32;-32"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>
                </>
              ) : (
                <>Login</>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
