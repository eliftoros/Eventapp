import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, X, Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

export default function EventManagement() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [cities, setCities] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        title: '',
        description: '',
        date: '',
        imageUrl: '',
        categoryId: '',
        cityId: '',
        locationId: ''
    });

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        if (!user) return;

        try {
            const [eventsRes, citiesRes, locationsRes, categoriesRes] = await Promise.all([
                api.get('/events'),
                api.get('/cities'),
                api.get('/locations'),
                api.get('/categories')
            ]);

            // Filter events based on role
            let filteredEvents = eventsRes.data;
            if (user.role === 'ORGANIZER') {
                // ORGANIZER can only see their own events
                filteredEvents = eventsRes.data.filter(e => e.userId === user.id);
                console.log('Organizer events:', filteredEvents.length, 'Total events:', eventsRes.data.length);
            }

            setEvents(filteredEvents);
            setCities(citiesRes.data);
            setLocations(locationsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const { data } = await api.post('/events/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
            alert('Image uploaded successfully!');
        } catch (error) {
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                categoryId: Number(formData.categoryId),
                cityId: Number(formData.cityId),
                locationId: formData.locationId ? Number(formData.locationId) : undefined
            };

            if (editingEvent) {
                await api.patch(`/events/${editingEvent.id}`, payload);
                alert('Event updated successfully!');
            } else {
                await api.post('/events', payload);
                alert('Event created successfully!');
            }

            resetForm();
            fetchData();
        } catch (error) {
            alert('Failed to save event: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (event) => {
        setEditingEvent(event);
        setFormData({
            name: event.name || '',
            title: event.title || '',
            description: event.description || '',
            date: event.date ? new Date(event.date).toISOString().slice(0, 16) : '',
            imageUrl: event.imageUrl || '',
            categoryId: event.categoryId || '',
            cityId: event.cityId || '',
            locationId: event.locationId || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return;

        try {
            await api.delete(`/events/${id}`);
            alert('Event deleted successfully!');
            fetchData();
        } catch (error) {
            alert('Failed to delete event: ' + (error.response?.data?.message || error.message));
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            title: '',
            description: '',
            date: '',
            imageUrl: '',
            categoryId: '',
            cityId: '',
            locationId: ''
        });
        setEditingEvent(null);
        setShowModal(false);
    };

    const canManageEvent = (event) => {
        // Organizer can ONLY manage their own events
        if (user?.role === 'ORGANIZER') {
            const canManage = event.userId === user.id;
            if (!canManage) {
                console.log('Organizer cannot manage event:', {
                    eventId: event.id,
                    eventUserId: event.userId,
                    currentUserId: user.id,
                    match: event.userId === user.id
                });
            }
            return canManage;
        }

        // Users cannot manage any events
        return false;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                        Event Management
                    </h1>
                    <p className="text-zinc-400 mt-2">
                        Manage your events
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Create Event
                </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event, idx) => (
                    <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="card group"
                    >
                        {/* Event Image */}
                        <div className="aspect-video bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-lg mb-4 overflow-hidden">
                            {event.imageUrl ? (
                                <img
                                    src={event.imageUrl}
                                    alt={event.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Calendar className="w-12 h-12 text-zinc-700" />
                                </div>
                            )}
                        </div>

                        {/* Event Info */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {event.city?.name || 'Online'}
                                </span>
                                <span className="text-xs text-zinc-500">
                                    {new Date(event.date).toLocaleDateString()}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-white">{event.name}</h3>
                            <p className="text-sm text-zinc-400 line-clamp-2">
                                {event.description || 'No description'}
                            </p>
                        </div>

                        {/* Actions */}
                        {canManageEvent(event) && (
                            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800">
                                <button
                                    onClick={() => handleEdit(event)}
                                    className="flex-1 px-3 py-2 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-4 h-4" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="flex-1 px-3 py-2 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">
                                {editingEvent ? 'Edit Event' : 'Create New Event'}
                            </h2>
                            <button
                                onClick={resetForm}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-300">Event Image</label>
                                <div className="flex gap-4 items-center">
                                    {formData.imageUrl && (
                                        <img
                                            src={formData.imageUrl}
                                            alt="Preview"
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="input-field flex items-center justify-center gap-2 hover:border-primary transition-colors">
                                            <Upload className="w-4 h-4" />
                                            {uploading ? 'Uploading...' : 'Upload Image'}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Event Name */}
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Event Name *</label>
                                <input
                                    type="text"
                                    className="input-field w-full mt-1"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Title</label>
                                <input
                                    type="text"
                                    className="input-field w-full mt-1"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-sm font-medium text-zinc-300">Description</label>
                                <textarea
                                    className="input-field w-full mt-1 min-h-[100px]"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            {/* Date and Category */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-300">Date & Time *</label>
                                    <input
                                        type="datetime-local"
                                        className="input-field w-full mt-1"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-300">Category *</label>
                                    <select
                                        className="input-field w-full mt-1"
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* City and Location */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-zinc-300">City *</label>
                                    <select
                                        className="input-field w-full mt-1"
                                        value={formData.cityId}
                                        onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select City</option>
                                        {cities.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-zinc-300">Location</label>
                                    <select
                                        className="input-field w-full mt-1"
                                        value={formData.locationId}
                                        onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                                    >
                                        <option value="">Select Location (Optional)</option>
                                        {locations
                                            .filter(l => !formData.cityId || l.cityId === Number(formData.cityId))
                                            .map(l => (
                                                <option key={l.id} value={l.id}>{l.address}</option>
                                            ))}
                                    </select>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary"
                                >
                                    {editingEvent ? 'Update Event' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
