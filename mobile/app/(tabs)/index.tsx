import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from '../../services/storage';
import { LinearGradient } from 'expo-linear-gradient';
import api, { BASE_URL } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function EventListScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const router = useRouter();

  const fetchInitialData = async () => {
    try {
      // Önce kullanıcının bilgilerini alalım (Katılımcı mı Organizatör mü?)
      const userRes = await api.get('/users/profile');
      setUser(userRes.data);

      // Sonra etkinlikleri çekelim
      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data);
    } catch (error) {
      console.log('Veri çekme hatası:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/login');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const matched = cleaned.match(/.{1,4}/g);
    return matched ? matched.join(' ').substring(0, 19) : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`.substring(0, 5);
    }
    return cleaned;
  };

  const formatCvv = (text: string) => {
    return text.replace(/\D/g, '').substring(0, 3);
  };

  const handlePayment = async () => {
    const rawCardNumber = cardNumber.replace(/\s/g, '');
    if (rawCardNumber.length !== 16) {
      alert('Lütfen 16 haneli geçerli bir kart numarası girin.');
      return;
    }
    if (!/^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(expiryDate)) {
      alert('Lütfen geçerli bir son kullanma tarihi girin (AA/YY).');
      return;
    }
    if (cvv.length !== 3) {
      alert('Lütfen 3 haneli CVV kodunu girin.');
      return;
    }
    if (cardName.trim().length < 3) {
      alert('Lütfen geçerli bir kart sahibi adı girin.');
      return;
    }

    setPaymentLoading(true);

    // Gerçekçi bir ödeme deneyimi için 1.5 saniye bekletelim
    setTimeout(async () => {
      try {
        await api.post('/users/premium/upgrade');
        
        // Kullanıcı profilini güncelle
        const userRes = await api.get('/users/profile');
        setUser(userRes.data);

        alert('Ödemeniz başarıyla tamamlandı! Tebrikler, artık Premium üyesiniz! 🎉');
        
        // Reset state
        setShowPremiumModal(false);
        setShowCheckout(false);
        setCardName('');
        setCardNumber('');
        setExpiryDate('');
        setCvv('');
        
        // Verileri yenile
        await fetchInitialData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Ödeme işlemi sırasında bir hata oluştu.');
      } finally {
        setPaymentLoading(false);
      }
    }, 1500);
  };

  const joinEvent = async (id: number) => {
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      return;
    }

    const joinedEventsCount = events.filter(e => 
      e.participants?.some((p: any) => p.userId === user.id)
    ).length;

    if (!user?.isPremium && joinedEventsCount >= 3) {
      setShowPremiumModal(true);
      return;
    }

    try {
      await api.post(`/events/${id}/join`);
      fetchInitialData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Etkinliğe katılamadınız.');
    }
  };

  const leaveEvent = async (id: number) => {
    try {
      await api.delete(`/events/${id}/leave`);
      fetchInitialData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Etkinlikten ayrılamadınız.');
    }
  };

  const isParticipant = (event: any) => {
    if (!user) return false;
    return event.participants?.some((p: any) => p.userId === user.id);
  };

  const renderEvent = ({ item: event }: { item: any }) => {
    const isJoined = isParticipant(event);
    let imageUrl = event.imageUrl;
    if (imageUrl) {
      if (imageUrl.includes('localhost')) {
        imageUrl = imageUrl.replace('http://localhost:3000', BASE_URL);
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = `${BASE_URL}${imageUrl}`;
      }
    }

    const isPremiumEvent = event.user?.isPremium;

    return (
      <View className={`bg-zinc-900/80 border rounded-3xl mb-6 overflow-hidden shadow-lg shadow-black/50 ${isPremiumEvent ? 'border-amber-500/40 border-2' : 'border-zinc-800/60'}`}>
        {/* Etkinlik Görseli (Varsa) */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} className="w-full h-48 bg-zinc-800" resizeMode="cover" />
        ) : (
          <LinearGradient
            colors={['#27272a', '#18181b']}
            className="w-full h-48 items-center justify-center"
          >
            <Ionicons name="image-outline" size={48} color="#52525b" />
            <Text className="text-zinc-500 font-medium mt-2">Görsel Bulunmuyor</Text>
          </LinearGradient>
        )}

        <View className="p-5">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <View className="bg-blue-500/15 border border-blue-500/30 px-3 py-1.5 rounded-lg flex-row items-center mr-2">
                <Ionicons name="location" size={14} color="#60a5fa" />
                <Text className="text-xs font-bold text-blue-400 ml-1">
                  {event.city?.name || 'Online'}
                </Text>
              </View>
              {isPremiumEvent && (
                <View className="bg-amber-500/20 border border-amber-500/40 px-2 py-1 rounded-md flex-row items-center">
                  <Ionicons name="star" size={10} color="#f59e0b" style={{ marginRight: 2 }} />
                  <Text className="text-[10px] font-extrabold text-amber-500">ÖNE ÇIKAN</Text>
                </View>
              )}
            </View>
            <View className="bg-zinc-800/80 px-3 py-1.5 rounded-lg flex-row items-center">
              <Ionicons name="calendar" size={14} color="#a1a1aa" />
              <Text className="text-xs font-medium text-zinc-300 ml-1">
                {new Date(event.date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>

          <Text className="text-xl font-bold text-white mb-2">{event.name}</Text>
          <Text className="text-sm text-zinc-400 mb-5 leading-relaxed" numberOfLines={2}>
            {event.description || 'Bu etkinlik için henüz bir açıklama girilmemiş. Detaylar için etkinliğe katılın.'}
          </Text>

          <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-zinc-800/50">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full bg-primary/20 items-center justify-center mr-2 border border-primary/30">
                <Text className="text-primary font-bold text-xs">
                  {event.user?.name?.charAt(0)?.toUpperCase() || 'O'}
                </Text>
              </View>
              <Text className="text-xs text-zinc-400 font-medium">
                {event.user?.name || 'Bilinmiyor'}
              </Text>
            </View>

            {user?.role === 'USER' && (
              <TouchableOpacity
                onPress={() => isJoined ? leaveEvent(event.id) : joinEvent(event.id)}
                className={`px-5 py-2.5 rounded-xl flex-row items-center ${isJoined ? 'bg-red-500/15 border border-red-500/30' : 'bg-primary border border-primary/50 shadow-md shadow-primary/30'}`}
              >
                <Text className={`text-sm font-bold ${isJoined ? 'text-red-400' : 'text-white'}`}>
                  {isJoined ? 'Ayrıl' : 'Hemen Katıl'}
                </Text>
              </TouchableOpacity>
            )}
            
            {user?.role === 'ORGANIZER' && event.userId === user.id && (
              <View className="bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                <Text className="text-xs font-bold text-emerald-400">Senin Etkinliğin</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pt-4 pb-2 flex-row justify-between items-center">
        <View>
          <Text className="text-3xl font-bold text-white">Etkinlikler</Text>
          <Text className="text-zinc-400 mt-1">
            {user ? `Giriş yapıldı: ${user.email} (${user.role})` : 'Test Modu (Kullanıcı Yok)'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={handleLogout} className="bg-zinc-800 px-3 py-2 rounded-lg">
          <Text className="text-zinc-300 text-sm">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvent}
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#3b82f6']} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-32">
            <Ionicons name="calendar-clear-outline" size={64} color="#3f3f46" mb-4 />
            <Text className="text-zinc-400 text-lg font-medium mt-4">Henüz etkinlik bulunmuyor</Text>
            <Text className="text-zinc-600 text-sm mt-2 text-center px-10">
              {user?.role === 'ORGANIZER' ? 'Yeni bir etkinlik oluşturarak başlayabilirsiniz.' : 'Yakında yeni etkinlikler eklenecektir, takipte kalın.'}
            </Text>
          </View>
        }
      />

      {/* Organizer Floating Action Button */}
      {user?.role === 'ORGANIZER' && (
        <TouchableOpacity 
          onPress={() => router.push('/organizer/create-event')}
          className="absolute bottom-[100px] right-6 w-16 h-16 rounded-full overflow-hidden shadow-xl shadow-primary/40 z-50"
        >
          <LinearGradient
            colors={['#3b82f6', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}
          >
            <Ionicons name="add" size={32} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Premium Modal */}
      <Modal
        visible={showPremiumModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowPremiumModal(false);
          setShowCheckout(false);
        }}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 items-center shadow-2xl w-full">
            {!showCheckout ? (
              <View className="w-full items-center">
                <View className="w-16 h-16 rounded-full bg-amber-500/20 items-center justify-center mb-4">
                  <Ionicons name="star" size={32} color="#f59e0b" />
                </View>
                
                <Text className="text-2xl font-extrabold text-white mb-2 text-center">Premium'a Geçin</Text>
                <Text className="text-zinc-400 text-center mb-6 leading-relaxed">
                  Ücretsiz paketinizin sınırına ulaştınız (3 Etkinlik). Sınırsız etkinliğe katılmak, özel avantajlardan faydalanmak ve sürprizlere erişmek için Premium'a geçin!
                </Text>

                <View className="w-full gap-3 mb-6">
                  <View className="flex-row items-center bg-zinc-800/50 p-3 rounded-xl">
                    <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                    <Text className="text-zinc-300 ml-3">Sınırsız etkinliğe katılım hakkı</Text>
                  </View>
                  <View className="flex-row items-center bg-zinc-800/50 p-3 rounded-xl">
                    <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                    <Text className="text-zinc-300 ml-3">VIP etkinliklere erken erişim</Text>
                  </View>
                  <View className="flex-row items-center bg-zinc-800/50 p-3 rounded-xl">
                    <Ionicons name="checkmark-circle" size={20} color="#f59e0b" />
                    <Text className="text-zinc-300 ml-3">Etkinliklerde özel rozet</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  className="w-full rounded-2xl overflow-hidden mb-4 shadow-lg shadow-amber-500/30"
                  onPress={() => setShowCheckout(true)}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 18, alignItems: 'center' }}
                  >
                    <Text className="text-white font-bold text-lg">Aylık Sadece 49.99 TL</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => {
                    setShowPremiumModal(false);
                    setShowCheckout(false);
                  }} 
                  className="py-2"
                >
                  <Text className="text-zinc-500 font-medium">Belki Daha Sonra</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="w-full">
                <Text className="text-xl font-extrabold text-white mb-4 text-center">Güvenli Ödeme (Demo)</Text>

                {/* Görsel Kredi Kartı */}
                <View className="w-full mb-6 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
                  <LinearGradient
                    colors={['#d97706', '#9a3412']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ padding: 20, height: 160, justifyContent: 'space-between' }}
                  >
                    <View className="flex-row justify-between items-center">
                      <Text className="text-white/60 text-xs font-bold tracking-widest">WORLD EVENT CARD</Text>
                      <Ionicons name="wifi-outline" size={20} color="rgba(255,255,255,0.6)" style={{ transform: [{ rotate: '90deg' }] }} />
                    </View>

                    {/* Chip */}
                    <View className="w-10 h-7 rounded bg-yellow-500/80 border border-yellow-400/50 opacity-90 my-2" />

                    <View>
                      <Text className="text-white text-lg font-bold tracking-widest mb-2">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </Text>
                      <View className="flex-row justify-between items-center">
                        <Text className="text-white/80 text-xs uppercase font-medium max-w-[70%]" numberOfLines={1}>
                          {cardName || 'KART SAHİBİ'}
                        </Text>
                        <Text className="text-white/80 text-xs font-bold tracking-widest">
                          {expiryDate || 'AA/YY'}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </View>

                {/* Form Alanları */}
                <View className="space-y-3 mb-6">
                  <View>
                    <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">Kart Sahibi *</Text>
                    <TextInput
                      value={cardName}
                      onChangeText={setCardName}
                      placeholder="AD SOYAD"
                      placeholderTextColor="#52525b"
                      autoCapitalize="characters"
                      style={{ backgroundColor: '#27272a', borderColor: 'rgba(63, 63, 70, 0.6)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: 'white', fontSize: 14, fontWeight: '600' }}
                    />
                  </View>

                  <View>
                    <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">Kart Numarası *</Text>
                    <TextInput
                      value={cardNumber}
                      onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                      placeholder="0000 0000 0000 0000"
                      placeholderTextColor="#52525b"
                      keyboardType="numeric"
                      maxLength={19}
                      style={{ backgroundColor: '#27272a', borderColor: 'rgba(63, 63, 70, 0.6)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: 'white', fontSize: 14, fontWeight: '600' }}
                    />
                  </View>

                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">Son Kullanma *</Text>
                      <TextInput
                        value={expiryDate}
                        onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                        placeholder="AA/YY"
                        placeholderTextColor="#52525b"
                        keyboardType="numeric"
                        maxLength={5}
                        style={{ backgroundColor: '#27272a', borderColor: 'rgba(63, 63, 70, 0.6)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: 'white', fontSize: 14, fontWeight: '600', textAlign: 'center' }}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-zinc-400 text-xs font-bold mb-1 uppercase tracking-wider">CVV *</Text>
                      <TextInput
                        value={cvv}
                        onChangeText={(text) => setCvv(formatCvv(text))}
                        placeholder="000"
                        placeholderTextColor="#52525b"
                        keyboardType="numeric"
                        secureTextEntry={true}
                        maxLength={3}
                        style={{ backgroundColor: '#27272a', borderColor: 'rgba(63, 63, 70, 0.6)', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, color: 'white', fontSize: 14, fontWeight: '600', textAlign: 'center' }}
                      />
                    </View>
                  </View>
                </View>

                {/* Ödeme Düğmesi */}
                <TouchableOpacity 
                  className="w-full rounded-2xl overflow-hidden mb-3 shadow-lg shadow-amber-500/20"
                  onPress={handlePayment}
                  disabled={paymentLoading}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                  >
                    {paymentLoading ? (
                      <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                    ) : null}
                    <Text className="text-white font-bold text-base">
                      {paymentLoading ? 'Ödeme Onaylanıyor...' : '49.99 TL Öde ve Yükselt'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setShowCheckout(false)}
                  disabled={paymentLoading}
                  className="py-3 items-center bg-zinc-800/40 border border-zinc-800 rounded-2xl"
                >
                  <Text className="text-zinc-400 font-bold text-sm">Geri Dön</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
