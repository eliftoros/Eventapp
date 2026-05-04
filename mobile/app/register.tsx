import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const router = useRouter();
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      // Backend'deki register fonksiyonuna gönderilecek payload
      await api.post('/auth/register', { name, email, password, role });
      Alert.alert('Başarılı', 'Hesabınız oluşturuldu. Lütfen giriş yapın.');
      router.replace('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt başarısız oldu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="flex-1 justify-center p-6 min-h-screen">
        <View className="w-full max-w-md mx-auto">
          <View className="bg-surface border border-zinc-800 rounded-xl p-6">
            <Text className="text-2xl font-bold mb-6 text-center text-white">Hesap Oluştur</Text>
            
            {error ? (
              <View className="p-3 mb-4 bg-red-500/10 rounded-lg">
                <Text className="text-sm text-red-500">{error}</Text>
              </View>
            ) : null}

            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-zinc-400 mb-1">Ad Soyad</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface border border-zinc-800 rounded-lg text-white"
                  placeholder="Adınız ve Soyadınız"
                  placeholderTextColor="#71717a"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-zinc-400 mb-1">E-posta</Text>
                <TextInput
                  className="w-full px-4 py-3 bg-surface border border-zinc-800 rounded-lg text-white"
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
                  className="w-full px-4 py-3 bg-surface border border-zinc-800 rounded-lg text-white"
                  placeholder="Şifreniz"
                  placeholderTextColor="#71717a"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-zinc-400 mb-1">Hesap Türü</Text>
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => setRole('USER')}
                    className={`flex-1 p-3 rounded-lg border items-center ${
                      role === 'USER' 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-zinc-800 bg-surface'
                    }`}
                  >
                    <Text className={`font-medium ${role === 'USER' ? 'text-white' : 'text-zinc-400'}`}>
                      Katılımcı
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => setRole('ORGANIZER')}
                    className={`flex-1 p-3 rounded-lg border items-center ${
                      role === 'ORGANIZER' 
                        ? 'border-violet-500 bg-violet-500/10' 
                        : 'border-zinc-800 bg-surface'
                    }`}
                  >
                    <Text className={`font-medium ${role === 'ORGANIZER' ? 'text-white' : 'text-zinc-400'}`}>
                      Organizatör
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity onPress={handleRegister} className="mt-4 w-full rounded-lg overflow-hidden">
                <LinearGradient
                  colors={['#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingVertical: 16, alignItems: 'center', width: '100%' }}
                >
                  <Text className="text-white font-medium text-lg">Kayıt Ol</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View className="mt-6 flex-row justify-center items-center">
              <Text className="text-sm text-zinc-500">Zaten hesabınız var mı? </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text className="text-blue-400">Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
