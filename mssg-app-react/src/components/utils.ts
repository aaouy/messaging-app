import { MessageContentInterface, UrlInterface } from '../types';

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
  return cookieValue;
}

export const linkify = (text: string) => {
  const res: (MessageContentInterface | UrlInterface)[]  = []

  const urlRegex = /(?:https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;
  const noUrlText = text.split(urlRegex);
  const urls = text.match(urlRegex) || [];

  noUrlText.forEach((value, index) => {
    if (value)
      res.push({type: "text", content: value});
    if (urls[index]) {
      const url = urls[index];
      let href = url;
      if (url.startsWith("www."))
        href = `https://${url}`;
      res.push({type: "link", content: url, href: href});
    }
  })

  return res
}



const toCamelCase = (str: string): string => {
  return str.replace(/_([a-z])/g, (match, group1) => group1.toUpperCase());
};

export const convertSnakeToCamel = (obj: Record<string, any>): Record<string, any> => {
  const newObj: Record<string, any> = {};
  if (typeof obj !== 'object')
    return obj;
  
  for (const key in obj) {
    if (Array.isArray(obj[key])) {
      const arr = []
      for (const val of obj[key]) {
        arr.push(convertSnakeToCamel(val));
      }
      obj[key] = arr;
    } else if (obj[key] !== null && typeof obj[key] === 'object') {
      obj[key] = convertSnakeToCamel(obj[key]);
    }
    if (obj.hasOwnProperty(key)) {
      const newKey = toCamelCase(key);
      newObj[newKey] = obj[key];
    }
  }
  return newObj;
};