import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from '../services/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const [error, setError] = useState('');
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <View className="flex-1 bg-background relative">
      {/* Decorative Background Elements */}
      <View className="absolute top-[-50px] left-[-50px] w-64 h-64 rounded-full bg-primary/10" />
      <View className="absolute bottom-[-50px] right-[-50px] w-80 h-80 rounded-full bg-secondary/10" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-center p-6"
      >
        <View className="w-full max-w-md mx-auto z-10">
          
          {/* Header Area */}
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-2xl bg-surface border border-zinc-800 items-center justify-center mb-5">
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="calendar" size={24} color="white" />
              </LinearGradient>
            </View>
            <Text className="text-4xl font-extrabold text-white tracking-tight">EventApp</Text>
            <Text className="text-zinc-400 mt-2 text-base text-center">En iyi etkinlikleri keşfedin ve katılın.</Text>
          </View>

          {/* Form Container */}
          <View className="bg-surface border border-zinc-800 rounded-3xl p-6">
            <Text className="text-xl font-bold mb-6 text-white">Giriş Yap</Text>
            
            {error ? (
              <View className="p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center">
                <Ionicons name="alert-circle" size={20} color="#ef4444" className="mr-2" />
                <Text className="text-sm text-red-400 ml-2 flex-1">{error}</Text>
              </View>
            ) : null}

            <View className="gap-5">
              <View>
                <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">E-posta</Text>
                <View className={`flex-row items-center w-full px-4 py-3.5 bg-zinc-900 border ${isEmailFocused ? 'border-primary' : 'border-zinc-800'} rounded-2xl`}>
                  <Ionicons name="mail-outline" size={20} color={isEmailFocused ? '#3b82f6' : '#71717a'} />
                  <TextInput
                    className="flex-1 text-white ml-3 text-base"
                    placeholder="ornek@email.com"
                    placeholderTextColor="#52525b"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    onFocus={() => setIsEmailFocused(true)}
                    onBlur={() => setIsEmailFocused(false)}
                  />
                </View>
              </View>

              <View>
                <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Şifre</Text>
                <View className={`flex-row items-center w-full px-4 py-3.5 bg-zinc-900 border ${isPasswordFocused ? 'border-primary' : 'border-zinc-800'} rounded-2xl`}>
                  <Ionicons name="lock-closed-outline" size={20} color={isPasswordFocused ? '#3b82f6' : '#71717a'} />
                  <TextInput
                    className="flex-1 text-white ml-3 text-base"
                    placeholder="••••••••"
                    placeholderTextColor="#52525b"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-1">
                    <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#71717a" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity className="self-end mt-[-8px]">
                <Text className="text-sm text-primary">Şifremi Unuttum</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLogin} className="mt-2 w-full rounded-2xl overflow-hidden">
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 18, alignItems: 'center', width: '100%' }}
                >
                  <Text className="text-white font-bold text-lg">Giriş Yap</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-sm text-zinc-500">Hesabınız yok mu? </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text className="text-primary font-bold text-sm">Üye Ol</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              onPress={() => router.replace('/(tabs)')}
              className="mt-6 items-center"
            >
              <Text className="text-zinc-600 text-sm font-medium">Test için üye olmadan devam et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
