import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import api, { BASE_URL } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function JoinedEventsScreen() {
  const [events, setEvents] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = async () => {
    try {
      const userRes = await api.get('/users/profile');
      setUser(userRes.data);

      const eventsRes = await api.get('/events');
      setEvents(eventsRes.data);
    } catch (error) {
      console.log('Veri çekme hatası (JoinedEvents):', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const leaveEvent = async (id: number) => {
    if (Platform.OS === 'web') {
      const confirmLeave = window.confirm("Bu etkinlikten ayrılmak istediğinize emin misiniz?");
      if (confirmLeave) {
        try {
          await api.delete(`/events/${id}/leave`);
          fetchData();
        } catch (error: any) {
          alert(error.response?.data?.message || 'Etkinlikten ayrılamadınız.');
        }
      }
    } else {
      Alert.alert(
        "Etkinlikten Ayrıl",
        "Bu etkinlikten ayrılmak istediğinize emin misiniz?",
        [
          { text: "İptal", style: "cancel" },
          { 
            text: "Evet, Ayrıl", 
            style: "destructive",
            onPress: async () => {
              try {
                await api.delete(`/events/${id}/leave`);
                fetchData();
              } catch (error: any) {
                alert(error.response?.data?.message || 'Etkinlikten ayrılamadınız.');
              }
            }
          }
        ]
      );
    }
  };

  // Filter events the current logged-in participant has joined
  const myJoinedEvents = events.filter(e => 
    e.participants?.some((p: any) => p.userId === user?.id)
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
          <TouchableOpacity
            onPress={() => leaveEvent(event.id)}
            className="px-5 py-2 rounded-xl flex-row items-center bg-red-500/15 border border-red-500/30"
          >
            <Ionicons name="exit-outline" size={16} color="#ef4444" style={{ marginRight: 6 }} />
            <Text className="text-sm font-bold text-red-400">Katılımı İptal Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-background justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // If user is an organizer, we show them a notice directing them to profile.
  if (user?.role === 'ORGANIZER') {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top']}>
        <View className="px-6 pt-4 pb-6 border-b border-zinc-800/50">
          <Text className="text-3xl font-bold text-white">Etkinliklerim</Text>
        </View>
        <View className="flex-1 items-center justify-center p-8">
          <View className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl items-center w-full shadow-2xl">
            <Ionicons name="calendar-outline" size={64} color="#3b82f6" style={{ marginBottom: 16 }} />
            <Text className="text-xl font-bold text-white mb-2 text-center">Organizatör Paneli</Text>
            <Text className="text-zinc-400 text-center text-sm leading-relaxed mb-6">
              Bu sayfa sadece katılımcıların katıldığı etkinlikleri listeler. Organizatör olarak kendi oluşturduğunuz etkinlikleri "Profilim" sekmesinden kolayca yönetebilir ve katılımcıları listeyebilirsiniz.
            </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(tabs)/profile')}
              className="bg-blue-500 px-6 py-3 rounded-2xl w-full items-center"
            >
              <Text className="text-white font-bold text-base">Profilime Git</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-6 pt-4 pb-6 border-b border-zinc-800/50">
        <Text className="text-3xl font-bold text-white">Etkinliklerim</Text>
        <Text className="text-zinc-400 mt-1 text-sm">Katılmak için kayıt olduğunuz tüm etkinlikler</Text>
      </View>

      <FlatList
        data={myJoinedEvents}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={['#3b82f6']} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-20 bg-zinc-900/50 rounded-3xl border border-zinc-800 mx-5 mt-4">
            <Ionicons name="calendar-outline" size={48} color="#52525b" style={{ marginBottom: 16 }} />
            <Text className="text-zinc-400 font-bold text-base text-center mb-1">Henüz bir etkinliğe katılmadınız</Text>
            <Text className="text-zinc-600 text-xs text-center px-6">Keşfet veya Ana Sayfaya giderek ilginizi çeken etkinliklere kayıt olabilirsiniz.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
