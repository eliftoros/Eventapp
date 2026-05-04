import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.access_token) {
        await SecureStore.setItemAsync('userToken', response.data.access_token);
        router.replace('/(tabs)');
      }
    } catch (err) {
      setError('E-posta veya şifre hatalı.');
    }
  };

  return (
    <View className="flex-1 bg-background justify-center p-6">
      <View className="w-full max-w-md mx-auto">
        <View className="bg-surface border border-zinc-800 rounded-xl p-6">
          <Text className="text-2xl font-bold mb-6 text-center text-white">Tekrar Hoş Geldiniz</Text>
          
          {error ? (
            <View className="p-3 mb-4 bg-red-500/10 rounded-lg">
              <Text className="text-sm text-red-500">{error}</Text>
            </View>
          ) : null}

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-zinc-400 mb-1">E-posta</Text>
              <TextInput
                className="w-full px-4 py-4 bg-surface border border-zinc-800 rounded-lg text-white"
                placeholder="E-posta adresiniz"
                placeholderTextColor="#71717a"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-zinc-400 mb-1">Şifre</Text>
              <TextInput
                className="w-full px-4 py-4 bg-surface border border-zinc-800 rounded-lg text-white"
                placeholder="Şifreniz"
                placeholderTextColor="#71717a"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity onPress={handleLogin} className="mt-4 w-full rounded-lg overflow-hidden">
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 16, alignItems: 'center', width: '100%' }}
              >
                <Text className="text-white font-medium text-lg">Giriş Yap</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View className="mt-6 flex-row justify-center items-center">
            <Text className="text-sm text-zinc-500">Hesabınız yok mu? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-blue-400">Üye Ol</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)')}
            className="mt-6 items-center"
          >
            <Text className="text-zinc-600 text-sm">Test için üye olmadan devam et</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
