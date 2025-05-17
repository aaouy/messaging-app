export interface FailureAlertProps {
    showAlert: boolean;
    closeAlert: (event: React.MouseEvent<HTMLButtonElement>) => void;
    errorMessage: string;
}