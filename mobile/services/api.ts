import axios from 'axios';
import * as SecureStore from './storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';

// Backend .env dosyasında PORT=3000 olduğu için 3000'i kullanıyoruz.
const getBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return 'http://localhost:3000';
};

export const BASE_URL = getBaseUrl();

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
