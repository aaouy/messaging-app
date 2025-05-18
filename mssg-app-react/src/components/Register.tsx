import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCookie } from './utils';
import SuccessAlert from './SuccessAlert';
import FailureAlert from './FailureAlert';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('Invalid username or password!');
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [registrationSucessful, setRegistrationSucessful] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    navigate('/login');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
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

      setIsLoading(false);
      setRegistrationSucessful(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error: any) {
      if (error.message === 'Username already exists') {
        setErrorMessage(error.message);
      }
      setShowAlert(true);
      setIsLoading(false);
    }
  };
  return (
    <>
      {registrationSucessful && (
        <SuccessAlert
          header="Registration Successful!"
          description="Please login to your account."
        ></SuccessAlert>
      )}
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
          <FailureAlert
            showAlert={showAlert}
            closeAlert={closeAlert}
            errorMessage={errorMessage}
          ></FailureAlert>
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
                    </circle>
                  </svg>
                </>
              ) : (
                <>Register</>
              )}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
