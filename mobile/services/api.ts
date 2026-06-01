import axios from 'axios';
import * as SecureStore from './storage';
import { Platform } from 'react-native';

// Backend .env dosyasında PORT=3000 olduğu için 3000'i kullanıyoruz.
export const BASE_URL = Platform.OS === 'web' 
  ? 'http://localhost:3000' 
  : 'http://192.168.1.9:3000';

const api = axios.create({
  baseURL: BASE_URL,
});

// Her istekten önce SecureStore'daki token'ı alıp Header'a ekler
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
