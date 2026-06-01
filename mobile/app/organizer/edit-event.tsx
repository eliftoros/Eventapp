import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export default function EditEventScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [cityId, setCityId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<any>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          api.get('/categories'),
          api.get('/cities')
        ]);
        setCategories(catRes.data);
        setCities(cityRes.data);

        if (id) {
          const eventRes = await api.get(`/events/${id}`);
          const ev = eventRes.data;
          setName(ev.name || '');
          setDescription(ev.description || '');
          // ev.date is an ISO string, convert to YYYY-MM-DD
          if (ev.date) {
            setDate(ev.date.split('T')[0]);
          }
          setCategoryId(ev.categoryId);
          setCityId(ev.cityId);
          if (ev.imageUrl) {
            let fullUrl = ev.imageUrl;
            if (fullUrl.includes('localhost')) {
              fullUrl = fullUrl.replace('http://localhost:3000', api.defaults.baseURL || '');
            } else if (!fullUrl.startsWith('http')) {
              fullUrl = `${api.defaults.baseURL}${fullUrl}`;
            }
            setImageUri(fullUrl);
          }
        }
      } catch (error) {
        console.error('Veri yüklenemedi', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      if (Platform.OS === 'web') {
        setImageFile((result.assets[0] as any).file);
      }
    }
  };

  const handleUpdate = async () => {
    if (!name || !date || !categoryId || !cityId) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları (Ad, Tarih, Kategori, Şehir) doldurun.');
      return;
    }

    let parsedDate;
    try {
      parsedDate = new Date(date).toISOString();
    } catch (e) {
      Alert.alert('Hata', 'Lütfen geçerli bir tarih formatı girin (Örn: 2026-05-20)');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalImageUrl = null;
      if (imageUri) {
        const formData = new FormData();
        
        if (Platform.OS === 'web' && imageFile) {
          formData.append('image', imageFile);
        } else {
          const filename = imageUri.split('/').pop() || 'image.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;
          formData.append('image', { uri: imageUri, name: filename, type } as any);
        }

        const uploadRes = await api.post('/events/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        finalImageUrl = uploadRes.data.imageUrl;
      }

      let updateData: any = {
        name,
        description,
        date: parsedDate,
        categoryId,
        cityId,
      };
      
      // Sadece yeni bir resim yüklendiyse imageUrl'i güncelle
      if (finalImageUrl) {
        updateData.imageUrl = finalImageUrl;
      }

      await api.patch(`/events/${id}`, updateData);
      Alert.alert('Başarılı', 'Etkinlik başarıyla güncellendi!');
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Etkinlik güncellenemedi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <View className="absolute top-[-100px] right-[-50px] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      <View className="absolute bottom-[-50px] left-[-50px] w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
      
      <View className="pt-12 pb-4 px-6 flex-row items-center justify-between border-b border-zinc-800/50 bg-background/90">
        <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-zinc-800">
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white">Etkinliği Düzenle</Text>
        <View className="w-10 h-10" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          
          <View className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            {/* Image Picker */}
            <TouchableOpacity 
              onPress={pickImage}
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl mb-6 items-center justify-center overflow-hidden"
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" />
              ) : (
                <View className="items-center justify-center">
                  <Ionicons name="camera" size={32} color="#71717a" mb-2 />
                  <Text className="text-zinc-500 font-medium">Etkinlik Görseli Ekle</Text>
                </View>
              )}
            </TouchableOpacity>

            <View className="mb-6">
              <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Etkinlik Adı *</Text>
              <View className="flex-row items-center w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <Ionicons name="text-outline" size={20} color="#71717a" />
                <TextInput
                  className="flex-1 text-white ml-3 text-base"
                  placeholder="Harika bir isim düşünün..."
                  placeholderTextColor="#52525b"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Tarih * (YYYY-AA-GG)</Text>
              <View className="flex-row items-center w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl">
                <Ionicons name="calendar-outline" size={20} color="#71717a" />
                <TextInput
                  className="flex-1 text-white ml-3 text-base"
                  placeholder="2026-05-20"
                  placeholderTextColor="#52525b"
                  value={date}
                  onChangeText={setDate}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Kategori *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setCategoryId(cat.id)}
                    className={`px-4 py-2 mr-3 rounded-xl border ${categoryId === cat.id ? 'border-blue-500 bg-blue-500/20' : 'border-zinc-800 bg-zinc-950'}`}
                  >
                    <Text className={`font-medium ${categoryId === cat.id ? 'text-blue-400' : 'text-zinc-400'}`}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Şehir *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city.id}
                    onPress={() => setCityId(city.id)}
                    className={`px-4 py-2 mr-3 rounded-xl border ${cityId === city.id ? 'border-purple-500 bg-purple-500/20' : 'border-zinc-800 bg-zinc-950'}`}
                  >
                    <Text className={`font-medium ${cityId === city.id ? 'text-purple-400' : 'text-zinc-400'}`}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-medium text-zinc-400 mb-2 ml-1">Açıklama</Text>
              <View className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl min-h-[100px]">
                <TextInput
                  className="flex-1 text-white text-base"
                  placeholder="Etkinlik detaylarından bahsedin..."
                  placeholderTextColor="#52525b"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  textAlignVertical="top"
                />
              </View>
            </View>

            <TouchableOpacity 
              onPress={handleUpdate} 
              disabled={isSubmitting}
              className={`w-full rounded-2xl overflow-hidden ${isSubmitting ? 'opacity-70' : ''}`}
            >
              <LinearGradient
                colors={['#3b82f6', '#8b5cf6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ paddingVertical: 18, alignItems: 'center', width: '100%' }}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Değişiklikleri Kaydet</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
