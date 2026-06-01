import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const router = useRouter();
  const [error, setError] = useState('');
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    try {
      await api.post('/auth/register', { name, email, password, role });
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu. Lütfen giriş yapın.');
      router.replace('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <View className="flex-1 bg-background relative">
      {/* Decorative Background Elements */}
      <View className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-secondary/10" />
      <View className="absolute bottom-[20%] left-[-50px] w-80 h-80 rounded-full bg-primary/10" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="w-full max-w-md mx-auto z-10 pt-10">
            
            {/* Header Area */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-surface border border-zinc-800 items-center justify-center mb-5">
                <LinearGradient
                  colors={['#8b5cf6', '#ec4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="person-add" size={24} color="white" />
                </LinearGradient>
              </View>
              <Text className="text-3xl font-extrabold text-white tracking-tight">Aramıza Katıl</Text>
              <Text className="text-zinc-400 mt-2 text-base text-center">Hesabınızı oluşturarak etkinlik dünyasına adım atın.</Text>
            </View>

            {/* Form Container */}
            <View className="bg-surface border border-zinc-800 rounded-3xl p-6 mb-10">
              
              {error ? (
                <View className="p-4 mb-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex-row items-center">
                  <Ionicons name="alert-circle" size={20} color="#ef4444" className="mr-2" />
                  <Text className="text-sm text-red-400 ml-2 flex-1">{error}</Text>
                </View>
              ) : null}

              <View className="gap-5">
                <View>
                  <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Ad Soyad</Text>
                  <View className={`flex-row items-center w-full px-4 py-3.5 bg-zinc-900 border ${isNameFocused ? 'border-primary' : 'border-zinc-800'} rounded-2xl`}>
                    <Ionicons name="person-outline" size={20} color={isNameFocused ? '#3b82f6' : '#71717a'} />
                    <TextInput
                      className="flex-1 text-white ml-3 text-base"
                      placeholder="Adınız ve Soyadınız"
                      placeholderTextColor="#52525b"
                      value={name}
                      onChangeText={setName}
                      onFocus={() => setIsNameFocused(true)}
                      onBlur={() => setIsNameFocused(false)}
                    />
                  </View>
                </View>

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

                <View>
                  <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Hesap Türü</Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() => setRole('USER')}
                      className={`flex-1 p-4 rounded-2xl border flex-row items-center justify-center ${
                        role === 'USER' 
                          ? 'border-blue-500 bg-blue-500/10' 
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <Ionicons name="ticket" size={18} color={role === 'USER' ? '#3b82f6' : '#71717a'} className="mr-2" />
                      <Text className={`font-medium ml-2 ${role === 'USER' ? 'text-white' : 'text-zinc-400'}`}>
                        Katılımcı
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      onPress={() => setRole('ORGANIZER')}
                      className={`flex-1 p-4 rounded-2xl border flex-row items-center justify-center ${
                        role === 'ORGANIZER' 
                          ? 'border-violet-500 bg-violet-500/10' 
                          : 'border-zinc-800 bg-zinc-900'
                      }`}
                    >
                      <Ionicons name="megaphone" size={18} color={role === 'ORGANIZER' ? '#8b5cf6' : '#71717a'} className="mr-2" />
                      <Text className={`font-medium ml-2 ${role === 'ORGANIZER' ? 'text-white' : 'text-zinc-400'}`}>
                        Organizatör
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity onPress={handleRegister} className="mt-4 w-full rounded-2xl overflow-hidden shadow-lg shadow-secondary/30">
                  <LinearGradient
                    colors={['#8b5cf6', '#ec4899']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 18, alignItems: 'center', width: '100%' }}
                  >
                    <Text className="text-white font-bold text-lg">Hesap Oluştur</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View className="mt-8 flex-row justify-center items-center">
                <Text className="text-sm text-zinc-500">Zaten hesabınız var mı? </Text>
                <TouchableOpacity onPress={() => router.push('/login')}>
                  <Text className="text-secondary font-bold text-sm">Giriş Yap</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
