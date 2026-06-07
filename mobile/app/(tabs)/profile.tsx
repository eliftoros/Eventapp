import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, Alert, Platform, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import * as SecureStore from '../../services/storage';
import { LinearGradient } from 'expo-linear-gradient';
import api, { BASE_URL } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const router = useRouter();

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
        fetchInitialData();
      } catch (error: any) {
        Alert.alert('Hata', error.response?.data?.message || 'Ödeme işlemi sırasında bir hata oluştu.');
      } finally {
        setPaymentLoading(false);
      }
    }, 1500);
  };

  const fetchInitialData = async () => {
    try {
      const userRes = await api.get('/users/profile');
      setUser(userRes.data);

      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data);
    } catch (error) {
      console.log('Veri çekme hatası:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchInitialData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInitialData();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/login');
  };

  const viewParticipants = async (event: any) => {
    setLoadingParticipants(true);
    setSelectedEvent(event);
    setShowParticipantsModal(true);
    try {
      const res = await api.get(`/events/${event.id}`);
      setSelectedEvent(res.data);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Katılımcılar yüklenemedi.');
    } finally {
      setLoadingParticipants(false);
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

  const deleteEvent = (id: number) => {
    if (Platform.OS === 'web') {
      const confirmDelete = window.confirm("Bu etkinliği silmek istediğinize emin misiniz?");
      if (confirmDelete) {
        api.delete(`/events/${id}`).then(() => fetchInitialData()).catch((err) => {
          alert(err.response?.data?.message || 'Etkinlik silinemedi.');
        });
      }
    } else {
      Alert.alert(
        "Etkinliği Sil",
        "Bu etkinliği silmek istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Sil", 
            style: "destructive",
            onPress: async () => {
              try {
                await api.delete(`/events/${id}`);
                fetchInitialData();
              } catch (error: any) {
                alert(error.response?.data?.message || 'Etkinlik silinemedi.');
              }
            }
          }
        ]
      );
    }
  };

  const myEvents = events.filter(e => 
    user?.role === 'ORGANIZER' 
      ? e.userId === user.id 
      : e.participants?.some((p: any) => p.userId === user.id)
  );

  const renderEvent = ({ item: event }: { item: any }) => {
    let imageUrl = event.imageUrl;
    if (imageUrl) {
      if (imageUrl.includes('localhost')) {
        imageUrl = imageUrl.replace('http://localhost:3000', BASE_URL);
      } else if (!imageUrl.startsWith('http')) {
        imageUrl = `${BASE_URL}${imageUrl}`;
      }
    }

    return (
      <View className="bg-zinc-900/80 border border-zinc-800/60 rounded-3xl mb-6 overflow-hidden shadow-lg shadow-black/50">
        <View className="flex-row p-4">
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} className="w-24 h-24 rounded-2xl bg-zinc-800" resizeMode="cover" />
          ) : (
            <LinearGradient
              colors={['#27272a', '#18181b']}
              className="w-24 h-24 rounded-2xl items-center justify-center"
            >
              <Ionicons name="image-outline" size={24} color="#52525b" />
            </LinearGradient>
          )}

          <View className="flex-1 ml-4 justify-center">
            <Text className="text-lg font-bold text-white mb-1" numberOfLines={1}>{event.name}</Text>
            
            <View className="flex-row items-center mb-1">
              <Ionicons name="calendar" size={14} color="#a1a1aa" className="mr-1" />
              <Text className="text-xs font-medium text-zinc-300">
                {new Date(event.date).toLocaleDateString('tr-TR')}
              </Text>
            </View>

            <View className="flex-row items-center">
              <Ionicons name="location" size={14} color="#60a5fa" className="mr-1" />
              <Text className="text-xs font-bold text-blue-400">
                {event.city?.name || 'Online'}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-4 pb-4 pt-2 border-t border-zinc-800/50 flex-row justify-end">
          {user?.role === 'USER' && (
            <TouchableOpacity
              onPress={() => leaveEvent(event.id)}
              className="px-5 py-2 rounded-xl flex-row items-center bg-red-500/15 border border-red-500/30"
            >
              <Text className="text-sm font-bold text-red-400">Katılımı İptal Et</Text>
            </TouchableOpacity>
          )}
          {user?.role === 'ORGANIZER' && (
            <View className="flex-1">
              <TouchableOpacity
                onPress={() => viewParticipants(event)}
                className="w-full py-2.5 mb-2 rounded-xl flex-row items-center justify-center bg-zinc-800 border border-zinc-700"
              >
                <Ionicons name="people-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text className="text-sm font-bold text-white">Katılımcılar ({event.participants?.length || 0})</Text>
              </TouchableOpacity>
              <View className="flex-row items-center justify-end">
                <TouchableOpacity
                  onPress={() => deleteEvent(event.id)}
                  className="flex-1 py-2 mr-3 rounded-xl flex-row items-center justify-center bg-red-500/10 border border-red-500/20"
                >
                  <Text className="text-sm font-bold text-red-400">Sil</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push({ pathname: '/organizer/edit-event', params: { id: event.id } })}
                  className="flex-1 py-2 rounded-xl flex-row items-center justify-center bg-zinc-800 border border-zinc-700"
                >
                  <Text className="text-sm font-bold text-white">Düzenle</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pt-4 pb-6 border-b border-zinc-800/50">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-3xl font-bold text-white">Profilim</Text>
          <TouchableOpacity onPress={handleLogout} className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
            <Text className="text-red-400 font-bold text-sm">Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center border-2 border-primary/40 mr-4">
            <Text className="text-2xl font-bold text-primary">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text className="text-xl font-bold text-white">{user?.name || 'Kullanıcı'}</Text>
            <Text className="text-zinc-400">{user?.email}</Text>
            <View className="flex-row gap-2 mt-1">
              <View className="bg-zinc-800 px-2 py-1 rounded-md">
                <Text className="text-xs font-bold text-zinc-300">
                  {user?.role === 'ORGANIZER' ? 'ORGANİZATÖR' : 'KATILIMCI'}
                </Text>
              </View>
              {user?.isPremium && (
                <View className="bg-amber-500/20 border border-amber-500/40 px-2 py-1 rounded-md flex-row items-center">
                  <Ionicons name="star" size={10} color="#f59e0b" style={{ marginRight: 2 }} />
                  <Text className="text-xs font-extrabold text-amber-500">PREMIUM</Text>
                </View>
              )}
              {user?.role === 'ORGANIZER' && !user?.isPremium && (
                <TouchableOpacity onPress={() => setShowPremiumModal(true)} className="self-start">
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="px-2 py-1 rounded-md flex-row items-center justify-center border border-amber-500/20"
                  >
                    <Ionicons name="star" size={10} color="white" style={{ marginRight: 3 }} />
                    <Text className="text-[10px] font-extrabold text-white">PREMIUM'A YÜKSELT</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      <View className="px-6 py-4">
        <Text className="text-xl font-bold text-white mb-2">
          {user?.role === 'ORGANIZER' ? 'Oluşturduğum Etkinlikler' : 'Katıldığım Etkinlikler'}
        </Text>
      </View>

      <FlatList
        data={myEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#3b82f6']} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 mx-5 mt-4">
            <Ionicons name="calendar-outline" size={48} color="#52525b" mb-4 />
            <Text className="text-zinc-400 font-medium">
              {user?.role === 'ORGANIZER' ? 'Henüz hiç etkinlik oluşturmadınız.' : 'Henüz hiçbir etkinliğe katılmadınız.'}
            </Text>
          </View>
        }
      />

      {/* Participants Modal */}
      <Modal
        visible={showParticipantsModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowParticipantsModal(false);
          setSelectedEvent(null);
        }}
      >
        <View className="flex-1 justify-end bg-black/70">
          <View className="bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 shadow-2xl h-[70%] w-full">
            {/* Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-1">
                <Text className="text-xl font-bold text-white">Katılımcı Listesi</Text>
                <Text className="text-xs text-zinc-400 mt-1" numberOfLines={1}>
                  {selectedEvent?.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowParticipantsModal(false);
                  setSelectedEvent(null);
                }}
                className="p-1 bg-zinc-800 rounded-full"
              >
                <Ionicons name="close" size={24} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            {/* List */}
            {loadingParticipants ? (
              <View className="items-center justify-center py-20">
                <Text className="text-zinc-400 font-bold mb-2">Yükleniyor...</Text>
              </View>
            ) : selectedEvent?.participants && selectedEvent.participants.length > 0 ? (
              <View className="flex-1">
                {/* Premium Banner */}
                {!user?.isPremium && (
                  <View className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl mb-4">
                    <View className="flex-row items-center mb-1">
                      <Ionicons name="star" size={16} color="#f59e0b" style={{ marginRight: 6 }} />
                      <Text className="text-sm font-bold text-amber-500">Premium Yükseltmesi Gerekli</Text>
                    </View>
                    <Text className="text-xs text-zinc-400 leading-relaxed">
                      Ücretsiz pakette sadece toplam katılımcı sayısını görebilirsiniz. İsimleri ve e-posta adreslerini görmek için Premium'a geçin.
                    </Text>
                  </View>
                )}

                <FlatList
                  data={selectedEvent.participants}
                  keyExtractor={(item: any) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item: p, index }) => (
                    <View className="flex-row items-center justify-between py-3 border-b border-zinc-800/40">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-zinc-800 items-center justify-center mr-3 border border-zinc-700">
                          <Text className="text-xs text-zinc-400 font-bold">{index + 1}</Text>
                        </View>
                        <View>
                          <Text className="text-sm font-bold text-white">
                            {p.user ? p.user.name : `Katılımcı #${index + 1}`}
                          </Text>
                          {p.user?.email && (
                            <Text className="text-xs text-zinc-500 mt-0.5">{p.user.email}</Text>
                          )}
                        </View>
                      </View>
                      {!p.user && (
                        <Text className="text-xs font-semibold text-zinc-600 italic">Gizli</Text>
                      )}
                    </View>
                  )}
                />
              </View>
            ) : (
              <View className="items-center justify-center py-20">
                <Ionicons name="people-outline" size={48} color="#52525b" style={{ marginBottom: 12 }} />
                <Text className="text-zinc-500 font-medium">Henüz katılan kimse yok.</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
}
