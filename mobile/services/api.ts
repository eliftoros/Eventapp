import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Lütfen bilgisayarınızın yerel IP adresini (veya backend'in çalıştığı IP'yi) girin.
// Backend .env dosyasında PORT=3000 olduğu için 3000'i kullanıyoruz.
const BASE_URL = 'http://10.242.3.134:3000';

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
