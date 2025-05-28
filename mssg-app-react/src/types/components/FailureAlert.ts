export interface FailureAlertProps {
    showAlert: boolean;
    setShowAlert: (showAlert: boolean) => void;
    errorMessage: string;
}