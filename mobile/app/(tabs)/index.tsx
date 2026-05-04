import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../../services/api';

export default function EventListScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
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

  const joinEvent = async (id: number) => {
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

    return (
      <View className="bg-surface border border-zinc-800 rounded-xl mb-4 overflow-hidden">
        {/* Etkinlik Görseli (Varsa) */}
        {event.imageUrl ? (
          <Image source={{ uri: event.imageUrl }} className="w-full h-40 bg-zinc-800" />
        ) : (
          <LinearGradient
            colors={['#27272a', '#18181b']}
            className="w-full h-32 items-center justify-center"
          >
            <Text className="text-zinc-600 font-bold text-lg">Event Görseli Yok</Text>
          </LinearGradient>
        )}

        <View className="p-4">
          <View className="flex-row justify-between items-start mb-2">
            <View className="bg-blue-500/10 border border-blue-500/20 px-2 py-1 rounded">
              <Text className="text-xs font-semibold text-blue-400">
                {event.city?.name || 'Online'}
              </Text>
            </View>
            <Text className="text-xs text-zinc-500">
              {new Date(event.date).toLocaleDateString('tr-TR')}
            </Text>
          </View>

          <Text className="text-lg font-bold text-white mb-2">{event.name}</Text>
          <Text className="text-sm text-zinc-400 mb-4" numberOfLines={2}>
            {event.description || 'Açıklama bulunmuyor.'}
          </Text>

          <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-zinc-800">
            <Text className="text-xs text-zinc-500">
              Organizatör: {event.user?.name || 'Bilinmiyor'}
            </Text>

            {user?.role === 'USER' && (
              <TouchableOpacity
                onPress={() => isJoined ? leaveEvent(event.id) : joinEvent(event.id)}
                className={`px-4 py-2 rounded-lg ${isJoined ? 'bg-red-500/10' : 'bg-primary/20'}`}
              >
                <Text className={`text-sm font-medium ${isJoined ? 'text-red-400' : 'text-blue-400'}`}>
                  {isJoined ? 'Etkinlikten Ayrıl' : 'Hemen Katıl →'}
                </Text>
              </TouchableOpacity>
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
          <Text className="text-zinc-400 mt-1">Harika etkinlikleri keşfedin.</Text>
        </View>
        
        <TouchableOpacity onPress={handleLogout} className="bg-zinc-800 px-3 py-2 rounded-lg">
          <Text className="text-zinc-300 text-sm">Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvent}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20">
            <Text className="text-zinc-500">Henüz hiçbir etkinlik bulunmuyor.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
