import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>("Invalid Input");
  const [showAlert, setShowAlert] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const getCsrfToken = async () => {
      try {
        const getCsrfUrl = 'http://localhost:8000/user/get-csrf-token/';
        const response = await fetch(getCsrfUrl, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) throw new Error('CSRF token could not be fetch from the browser!');
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

  const closeAlert = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setShowAlert(false);
  };

  const toLogin = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    navigate("/login");
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const registerUrl = 'http://localhost:8000/user/register/';
    try {
      const userData = { username: username, password: password };
      const csrfCookie = getCookie('csrftoken');
      if (!csrfCookie) throw new Error('CSRF cookie was not able to be fetched from the browser!');

      const response = await fetch(registerUrl, {
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
        throw new Error(data.error);
      }

      navigate('/login');
    } catch (error: any) {
      if (error.message === "Username already exists") {
        setErrorMessage(error.message);
      }
      setShowAlert(true);
    }
  };
  return (
    <div className="flex relative left-1/2 top-1/2 rounded-md -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 border-1">
      <div className="flex flex-col text-white justify-center items-center w-1/2 h-full rounded-r-full bg-gray-400">
        <h1 className="text-center font-semibold text-4xl p-2">Hello, Welcome!</h1>
        <p className="text-center font-light p-4 mb-2">Already have an account? </p>
        <button
          onClick={toLogin}
          className="py-1 rounded-md cursor-pointer hover:scale-102 font-medium px-10 border-1"
        >
          Login
        </button>
      </div>
      <div className="flex flex-col justify-center items-center w-1/2 py-15 px-2">
        <h1 className="text-2xl font-semibold mb-2">Register</h1>
        <div
          className={`${
            showAlert ? 'visible' : 'invisible'
          } bg-red-100 text-sm border relative border-red-400 w-3/4 h-10 text-red-700 px-1 py-2 rounded
          `}
          role="alert"
        >
          <span className="block sm:inline">{errorMessage}</span>
          <span className="absolute top-0 right-0 pr-2 py-2">
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
          <input
            className="text-white text-md font-[450] mt-[20px] p-1.5 w-3/4 mb-[10px] bg-black cursor-pointer rounded-lg"
            type="submit"
            value="Register"
          />
        </form>
      </div>
    </div>
  );
};

export default Register;
