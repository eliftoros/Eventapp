import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

export default function CreateEventScreen() {
  const router = useRouter();
  
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
  const [user, setUser] = useState<any>(null);
  const [myEventsCountThisMonth, setMyEventsCountThisMonth] = useState(0);

  // Premium modal states
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ').substring(0, 19) : cleaned;
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`.substring(0, 5);
    }
    return cleaned;
  };

  const formatCvv = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 3);
  };

  const handlePayment = async () => {
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (rawCardNumber.length !== 16) {
      Alert.alert('Hata', 'Lütfen 16 haneli geçerli bir kart numarası girin.');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
      Alert.alert('Hata', 'Lütfen geçerli bir son kullanma tarihi girin (AA/YY).');
      return;
    }
    if (cvv.length !== 3) {
      Alert.alert('Hata', 'Lütfen 3 haneli CVV kodunu girin.');
      return;
    }
    if (cardName.trim().length < 3) {
      Alert.alert('Hata', 'Lütfen geçerli bir kart sahibi adı girin.');
      return;
    }

    setPaymentLoading(true);
    setTimeout(async () => {
      try {
        await api.post('/users/premium/upgrade');
        Alert.alert('Tebrikler 🎉', 'Ödemeniz başarıyla tamamlandı! Artık Premium üyesiniz!');
        setShowPremiumModal(false);
        setShowCheckout(false);
        setCardName('');
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        
        // Refresh the user info local state to immediately unlock poster selection
        const userRes = await api.get('/users/profile');
        setUser(userRes.data);
      } catch (error: any) {
        Alert.alert('Hata', error.response?.data?.message || 'Ödeme işlemi sırasında bir hata oluştu.');
      } finally {
        setPaymentLoading(false);
      }
    }, 1500);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, cityRes, userRes, eventsRes] = await Promise.all([
          api.get('/categories'),
          api.get('/cities'),
          api.get('/users/profile'),
          api.get('/events')
        ]);
        setCategories(catRes.data);
        setCities(cityRes.data);
        setUser(userRes.data);

        // Count current month events created by this organizer
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const count = eventsRes.data.filter((e: any) => {
          if (e.userId !== userRes.data.id) return false;
          const createdDate = new Date(e.createdAt || e.date);
          return createdDate >= startOfMonth && createdDate <= endOfMonth;
        }).length;

        setMyEventsCountThisMonth(count);
      } catch (error) {
        console.error('Veri yüklenemedi', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleCreate = async () => {
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

    if (user?.role === 'ORGANIZER' && !user?.isPremium && myEventsCountThisMonth >= 3) {
      Alert.alert(
        'Limit Aşıldı',
        'Ücretsiz paketinizin limitine ulaştınız. Ayda en fazla 3 etkinlik oluşturabilirsiniz. Lütfen Premium\'a geçin!'
      );
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

      await api.post('/events', {
        name,
        description,
        date: parsedDate,
        categoryId,
        cityId,
        imageUrl: finalImageUrl
      });
      Alert.alert('Başarılı', 'Etkinlik başarıyla oluşturuldu!');
      router.back();
    } catch (error: any) {
      Alert.alert('Hata', error.response?.data?.message || 'Etkinlik oluşturulamadı.');
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
        <Text className="text-xl font-bold text-white">Etkinlik Oluştur</Text>
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
              onPress={() => {
                if (user && !user.isPremium) {
                  setShowPremiumModal(true);
                  return;
                }
                pickImage();
              }}
              className="w-full h-40 bg-zinc-950 border border-zinc-800 rounded-2xl mb-6 items-center justify-center overflow-hidden"
            >
              {imageUri ? (
                <Image source={{ uri: imageUri }} className="w-full h-full" />
              ) : (
                <View className="items-center justify-center">
                  <Ionicons name="star" size={32} color={user?.isPremium ? "#71717a" : "#f59e0b"} style={{ marginBottom: 8 }} />
                  <Text className="text-zinc-500 font-medium">
                    {user?.isPremium ? 'Etkinlik Görseli Ekle' : 'Görsel Ekle (Sadece Premium)'}
                  </Text>
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
              onPress={handleCreate} 
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
                  <Text className="text-white font-bold text-lg">Oluştur ve Yayınla</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Premium Upgrade Modal */}
      <Modal
        visible={showPremiumModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowPremiumModal(false);
          setShowCheckout(false);
        }}
      >
        <View className="flex-1 justify-end bg-black/80">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 shadow-2xl h-[85%] w-full relative">
            <TouchableOpacity
              onPress={() => {
                setShowPremiumModal(false);
                setShowCheckout(false);
              }}
              className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-full z-10"
            >
              <Ionicons name="close" size={20} color="#a1a1aa" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
              {!showCheckout ? (
                <View className="space-y-6 pt-4">
                  <View className="items-center text-center mb-6">
                    <View className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 items-center justify-center text-amber-500 mb-4 self-center">
                      <Ionicons name="star" size={32} color="#f59e0b" />
                    </View>
                    <Text className="text-2xl font-extrabold text-white text-center">Premium'a Geçin</Text>
                    <Text className="text-sm text-zinc-400 mt-2 text-center leading-relaxed">
                      Sınırsız etkinlik oluşturma ve VIP ayrıcalıklar için hemen Premium'a geçin!
                    </Text>
                  </View>

                  <View className="space-y-3 mb-8">
                    <View className="flex-row items-center gap-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                      <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                      <Text className="text-sm text-zinc-300 font-medium ml-2">Sınırsız etkinlik oluşturma hakkı</Text>
                    </View>
                    <View className="flex-row items-center gap-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                      <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                      <Text className="text-sm text-zinc-300 font-medium ml-2">VIP etkinlik etiketleme ve ön plana çıkarma</Text>
                    </View>
                    <View className="flex-row items-center gap-3 p-4 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                      <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                      <Text className="text-sm text-zinc-300 font-medium ml-2">İsminizin yanında altın 👑 PREMIUM rozeti</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => setShowCheckout(true)}>
                    <LinearGradient
                      colors={['#f59e0b', '#ea580c']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center' }}
                    >
                      <Text className="text-white font-bold text-lg">Şimdi Premium Ol</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              ) : (
                <View className="space-y-6 pt-4">
                  <View className="text-center mb-4">
                    <Text className="text-xl font-bold text-white text-center">Güvenli Ödeme (Demo)</Text>
                    <Text className="text-xs text-zinc-500 mt-1 text-center">Kart bilgilerinizi girerek aboneliğinizi başlatın</Text>
                  </View>

                  {/* Görsel Kredi Kartı */}
                  <LinearGradient
                    colors={['#f59e0b', '#ea580c', '#b91c1c']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ height: 180, borderRadius: 16, padding: 20, justifyContent: 'space-between', marginBottom: 20 }}
                  >
                    <View className="flex-row justify-between items-start">
                      <Text className="text-[10px] font-black text-white/50 tracking-widest uppercase">WORLD EVENT CARD</Text>
                      <Ionicons name="card" size={20} color="rgba(255,255,255,0.6)" />
                    </View>
                    <View className="w-10 h-7 bg-yellow-400/70 rounded border border-yellow-300/30 shadow my-1" />
                    <View className="space-y-2">
                      <Text className="text-white text-lg font-mono font-bold tracking-widest">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </Text>
                      <View className="flex-row justify-between items-end">
                        <Text className="text-[10px] font-bold text-white/80 tracking-wider truncate max-w-[70%] uppercase">
                          {cardName || 'KART SAHİBİ'}
                        </Text>
                        <Text className="text-[10px] font-mono font-bold text-white/80 tracking-widest">
                          {expiryDate || 'AA/YY'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>

                  {/* Form Input Fields */}
                  <View className="mb-4">
                    <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Kart Sahibi *</Text>
                    <TextInput
                      placeholder="AD SOYAD"
                      placeholderTextColor="#52525b"
                      value={cardName}
                      onChangeText={(val) => setCardName(val.toUpperCase())}
                      className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold uppercase"
                    />
                  </View>

                  <View className="mb-4">
                    <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Kart Numarası *</Text>
                    <TextInput
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor="#52525b"
                      keyboardType="numeric"
                      value={cardNumber}
                      onChangeText={(val) => setCardNumber(formatCardNumber(val))}
                      className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold"
                    />
                  </View>

                  <View className="flex-row gap-4 mb-6">
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Son Kullanma *</Text>
                      <TextInput
                        placeholder="AA/YY"
                        placeholderTextColor="#52525b"
                        keyboardType="numeric"
                        value={expiryDate}
                        onChangeText={(val) => setExpiryDate(formatExpiryDate(val))}
                        className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">CVV *</Text>
                      <TextInput
                        placeholder="000"
                        placeholderTextColor="#52525b"
                        keyboardType="numeric"
                        secureTextEntry
                        value={cvv}
                        onChangeText={(val) => setCvv(formatCvv(val))}
                        className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold"
                      />
                    </View>
                  </View>

                  <TouchableOpacity onPress={handlePayment} disabled={paymentLoading}>
                    <LinearGradient
                      colors={['#10b981', '#059669']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ paddingVertical: 16, borderRadius: 12, alignItems: 'center', opacity: paymentLoading ? 0.7 : 1 }}
                    >
                      {paymentLoading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text className="text-white font-bold text-lg">Ödemeyi Tamamla (49.90 ₺)</Text>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => setShowCheckout(false)}
                    className="py-3 items-center"
                  >
                    <Text className="text-sm font-bold text-zinc-400">Geri Dön</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
