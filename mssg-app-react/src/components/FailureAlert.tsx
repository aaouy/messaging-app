import { FailureAlertProps } from "../types/components/FailureAlert";

const FailureAlert = ({showAlert, closeAlert, errorMessage }: FailureAlertProps) => {
  return (
    <div
      className={`${
        showAlert ? 'visible' : 'invisible'
      } bg-red-100 text-sm border relative border-red-400 w-3/4 text-red-700 px-2 py-3 rounded
          `}
      role="alert"
    >
      <span className="block sm:inline">{errorMessage}</span>
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
  );
};

export default FailureAlert;
