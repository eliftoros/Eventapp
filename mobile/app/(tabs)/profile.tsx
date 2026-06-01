import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, Modal, Alert, Platform } from 'react-native';
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
  const router = useRouter();

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
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => deleteEvent(event.id)}
                className="px-5 py-2 mr-3 rounded-xl flex-row items-center bg-red-500/10 border border-red-500/20"
              >
                <Text className="text-sm font-bold text-red-400">Sil</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push({ pathname: '/organizer/edit-event', params: { id: event.id } })}
                className="px-5 py-2 rounded-xl flex-row items-center bg-zinc-800 border border-zinc-700"
              >
                <Text className="text-sm font-bold text-white">Düzenle</Text>
              </TouchableOpacity>
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
    </SafeAreaView>
  );
}
