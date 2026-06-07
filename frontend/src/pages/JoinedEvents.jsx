import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';

export default function JoinedEvents() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    };

    const leaveEvent = async (id) => {
        if (!confirm('Are you sure you want to leave this event?')) return;
        try {
            await api.delete(`/events/${id}/leave`);
            fetchData();
        } catch (error) {
            alert('Failed to leave event');
        }
    };

    const myJoinedEvents = events.filter(event => 
        event.participants?.some(p => p.userId === user?.id)
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-zinc-400">Loading events...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                    My Joined Events
                </h1>
                <p className="text-zinc-400 mt-2">
                    Events you are registered to participate in
                </p>
            </div>

            {myJoinedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myJoinedEvents.map((event, idx) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="card group hover:scale-[1.02] transition-transform duration-300 border border-zinc-800/60"
                        >
                            <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                {event.imageUrl ? (
                                    <img
                                        src={event.imageUrl}
                                        alt={event.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <Calendar className="w-12 h-12 text-zinc-700" />
                                )}
                            </div>
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {event.city?.name || 'Online'}
                                </span>
                                <span className="text-xs text-zinc-500">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-white">{event.name}</h3>
                            <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{event.description || 'No description'}</p>

                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
                                <div className="flex items-center gap-2 text-xs text-zinc-500">
                                    <Users className="w-3 h-3" />
                                    <span>Organizer: {event.user?.name}</span>
                                </div>
                                <button
                                    onClick={() => leaveEvent(event.id)}
                                    className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                >
                                    Leave Event
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-zinc-900/20 border border-zinc-800 rounded-2xl">
                    <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 font-medium">You haven't joined any events yet.</p>
                    <p className="text-zinc-600 text-sm mt-1">Browse the home page to find events to register for.</p>
                </div>
            )}
        </div>
    );
}
