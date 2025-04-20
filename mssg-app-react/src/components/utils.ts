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

export const detectLinks = (text: string): string => {
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    const linkedText = text.replace(urlRegex, (url) => {
        const fullUrl = url.startsWith('www.') ? `http://${url}` : url;
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
    return DOMPurify.sanitize(linkedText);
};

const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
};

export const convertSnakeToCamel = (obj: Record<string, any>): Record<string, any> => {
  const newObj: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== null && typeof obj[key] === 'object') {
      obj[key] = convertSnakeToCamel(obj[key]);
    }
    if (obj.hasOwnProperty(key)) {
      const newKey = toCamelCase(key);
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
};