import axios from "axios";
import { AxiosResponse } from "axios";
import DOMPurify from 'dompurify';

export function getCookie(name: string) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  console.log(cookieValue);
  return cookieValue;
}

export async function sendPostRequest<T>(endPoint: string, data: object): Promise<T> {
  try {
    const csrfToken = getCookie("csrftoken");
    const response: AxiosResponse<T> = await axios.post(endPoint, data, {
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrfToken,
      },
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
}

export const detectLinks = (text: string): string => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const linkedText = text.replace(urlRegex, (url) => {
        const fullUrl = url.startsWith('www.') ? `http://${url}` : url;
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    return DOMPurify.sanitize(linkedText);
};