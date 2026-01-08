import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users, Plus } from 'lucide-react';

export default function Home() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [cities, setCities] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [eventsRes, citiesRes] = await Promise.all([
                api.get('/events'),
                api.get('/cities')
            ]);
            setEvents(eventsRes.data);
            setCities(citiesRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const joinEvent = async (id) => {
        if (!user) return alert('Please login to join');
        try {
            await api.post(`/events/${id}/join`);
            alert('Joined successfully!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Could not join event');
        }
    };

    const leaveEvent = async (id) => {
        if (!user) return;
        try {
            await api.delete(`/events/${id}/leave`);
            alert('Left event successfully!');
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Could not leave event');
        }
    };

    const isParticipant = (event) => {
        return event.participants?.some(p => p.userId === user?.id);
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">Discover Events</h1>
                    <p className="text-zinc-400 mt-2">Find and join amazing events near you.</p>
                </div>
                {user?.role === 'ORGANIZER' && (
                    <Link to="/events" className="btn-primary flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Manage Events
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, idx) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card group hover:scale-[1.02] transition-transform duration-300"
                    >
                        <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                            {event.imageUrl ? (
                                <img
                                    src={event.imageUrl}
                                    alt={event.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <Calendar className="w-12 h-12 text-zinc-700 group-hover:text-primary transition-colors duration-500" />
                            )}
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                {event.city?.name || 'Online'}
                            </span>
                            <span className="text-xs text-zinc-500">{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 text-white group-hover:text-primary transition-colors">{event.name}</h3>
                        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">{event.description || 'No description provided.'}</p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <Users className="w-3 h-3" />
                                <span>Organizer: {event.user?.name}</span>
                            </div>
                            {user && user.role === 'USER' && (
                                isParticipant(event) ? (
                                    <button
                                        onClick={() => leaveEvent(event.id)}
                                        className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        Leave Event
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => joinEvent(event.id)}
                                        className="text-sm font-medium text-white hover:text-primary transition-colors"
                                    >
                                        Join Now →
                                    </button>
                                )
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
