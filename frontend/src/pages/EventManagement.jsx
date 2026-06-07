import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Upload, X, Calendar, MapPin, Image as ImageIcon, Star, CheckCircle, Loader2, Users } from 'lucide-react';

export default function EventManagement() {
    const { user, refreshUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [cities, setCities] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showParticipantsModal, setShowParticipantsModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [loadingParticipants, setLoadingParticipants] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, '');
        const matched = cleaned.match(/.{1,4}/g);
        return matched ? matched.join(' ').substring(0, 19) : cleaned;
    };

    const formatExpiryDate = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`.substring(0, 5);
        }
        return cleaned;
    };

    const formatCvv = (value) => {
        return value.replace(/\D/g, '').substring(0, 3);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
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

        setTimeout(async () => {
            try {
                await api.post('/users/premium/upgrade');
                await refreshUser();
                alert('Ödemeniz başarıyla tamamlandı! Tebrikler, artık Premium üyesiniz! 🎉');
                setShowPremiumModal(false);
                setShowCheckout(false);
                setCardName('');
                setCardNumber('');
                setExpiryDate('');
                setCvv('');
                fetchData();
            } catch (error) {
                alert(error.response?.data?.message || 'Ödeme işlemi sırasında bir hata oluştu.');
            } finally {
                setPaymentLoading(false);
            }
        }, 1500);
    };

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
            if (!editingEvent && user?.role === 'ORGANIZER' && !user?.isPremium) {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                
                const createdThisMonth = events.filter(e => {
                    const createdDate = new Date(e.createdAt || e.date);
                    return createdDate >= startOfMonth && createdDate <= endOfMonth;
                }).length;

                if (createdThisMonth >= 3) {
                    setShowPremiumModal(true);
                    return;
                }
            }

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

    const handleViewParticipants = async (event) => {
        setLoadingParticipants(true);
        setSelectedEvent(event);
        setShowParticipantsModal(true);
        try {
            const { data } = await api.get(`/events/${event.id}`);
            setSelectedEvent(data);
        } catch (error) {
            alert('Failed to load event details: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoadingParticipants(false);
        }
    };

    const handleExportCSV = (event) => {
        if (!event.participants || event.participants.length === 0) return;
        let csvContent = "data:text/csv;charset=utf-8,\uFEFFNo,Name,Email\n";
        event.participants.forEach((p, idx) => {
            const name = p.user ? p.user.name.replace(/,/g, "") : `Participant #${idx + 1}`;
            const email = p.user && p.user.email ? p.user.email.replace(/,/g, "") : "";
            csvContent += `${idx + 1},"${name}","${email}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${event.name.replace(/[\s/]+/g, "_")}_participants.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    onClick={() => {
                        if (user?.role === 'ORGANIZER' && !user?.isPremium) {
                            const now = new Date();
                            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                            const createdThisMonth = events.filter(e => {
                                const createdDate = new Date(e.createdAt || e.date);
                                return createdDate >= startOfMonth && createdDate <= endOfMonth;
                            }).length;

                            if (createdThisMonth >= 3) {
                                setShowPremiumModal(true);
                                return;
                            }
                        }
                        setShowModal(true);
                    }}
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
                            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-2">
                                <button
                                    onClick={() => handleViewParticipants(event)}
                                    className="w-full px-3 py-2 bg-zinc-800 text-zinc-300 rounded hover:bg-zinc-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <Users className="w-4 h-4" /> View Participants ({event.participants?.length || 0})
                                </button>
                                <div className="flex gap-2">
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
                                    {user?.isPremium ? (
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
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowModal(false);
                                                setShowPremiumModal(true);
                                            }}
                                            className="flex-1 input-field flex items-center justify-center gap-2 bg-amber-500/10 border border-dashed border-amber-500/30 hover:bg-amber-500/20 text-amber-500 transition-all cursor-pointer"
                                        >
                                            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                                            <span>Unlock Custom Poster (Get Premium)</span>
                                        </button>
                                    )}
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

            {/* Participants Modal */}
            <AnimatePresence>
                {showParticipantsModal && selectedEvent && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center p-6 border-b border-zinc-800">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Participants</h3>
                                    <p className="text-xs text-zinc-400 mt-1">{selectedEvent.name}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowParticipantsModal(false);
                                        setSelectedEvent(null);
                                    }}
                                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                                {loadingParticipants ? (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                        <p className="text-sm text-zinc-400">Loading participants...</p>
                                    </div>
                                ) : selectedEvent.participants && selectedEvent.participants.length > 0 ? (
                                    <div className="space-y-4">
                                        {/* CSV Export Button (Premium Only) */}
                                        {user?.isPremium && (
                                            <button
                                                onClick={() => handleExportCSV(selectedEvent)}
                                                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2 mb-2"
                                            >
                                                Export to CSV
                                            </button>
                                        )}

                                        {/* Premium Check & Upsell Banner */}
                                        {!user?.isPremium && (
                                            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3">
                                                <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-sm font-bold text-amber-500">Premium Upgrade Required</h4>
                                                    <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                                                        Ücretsiz pakette sadece toplam katılımcı sayısını görebilirsiniz. İsimleri ve e-posta adreslerini listelemek ve dışa aktarmak için Premium'a geçin.
                                                    </p>
                                                    <button
                                                        onClick={() => {
                                                            setShowParticipantsModal(false);
                                                            setShowPremiumModal(true);
                                                        }}
                                                        className="mt-3 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-colors px-3 py-1.5 rounded-lg"
                                                    >
                                                        Premium'a Yükselt
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Participant List */}
                                        <div className="divide-y divide-zinc-800/50">
                                            {selectedEvent.participants.map((p, idx) => (
                                                <div key={p.id} className="py-3 flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                                                            <span className="text-xs text-zinc-400 font-bold">
                                                                {idx + 1}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">
                                                                {p.user ? p.user.name : `Katılımcı #${idx + 1}`}
                                                            </p>
                                                            {p.user?.email && (
                                                                <p className="text-xs text-zinc-500 mt-0.5">
                                                                    {p.user.email}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {!p.user && (
                                                        <span className="text-xs text-zinc-600 font-medium italic">
                                                            Gizli
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-zinc-500 text-sm">
                                        No participants have joined this event yet.
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Premium Modal */}
            <AnimatePresence>
                {showPremiumModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
                        >
                            <button
                                onClick={() => {
                                    setShowPremiumModal(false);
                                    setShowCheckout(false);
                                }}
                                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {!showCheckout ? (
                                <div className="space-y-6">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                                            <Star className="w-8 h-8 fill-amber-500/20" />
                                        </div>
                                        <h2 className="text-2xl font-black text-white bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Premium'a Geçin</h2>
                                        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                                            Ücretsiz paketinizin limitine ulaştınız (Ayda en fazla 3 Etkinlik). Sınırsız etkinlik oluşturma ve VIP ayrıcalıklar için hemen Premium'a geçin!
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                                            <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span className="text-sm text-zinc-300 font-medium">Sınırsız etkinlik oluşturma hakkı</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                                            <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span className="text-sm text-zinc-300 font-medium">VIP etkinlik etiketleme ve ön plana çıkarma</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                                            <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span className="text-sm text-zinc-300 font-medium">İsminizin yanında altın 👑 PREMIUM rozeti</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setShowCheckout(true)}
                                        className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-lg shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98]"
                                    >
                                        Şimdi Premium Ol
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handlePayment} className="space-y-6">
                                    <div className="text-center">
                                        <h2 className="text-xl font-bold text-white">Güvenli Ödeme (Demo)</h2>
                                        <p className="text-xs text-zinc-500 mt-1">Kart bilgilerinizi girerek aboneliğinizi başlatın</p>
                                    </div>

                                    {/* Görsel Kredi Kartı */}
                                    <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-800 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden select-none border border-amber-400/20">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                                        <div className="flex justify-between items-start">
                                            <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">WORLD EVENT CARD</span>
                                            <svg className="w-5 h-5 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                                        </div>
                                        <div className="w-10 h-7 bg-yellow-400/70 rounded border border-yellow-300/30 shadow my-1" />
                                        <div className="space-y-2">
                                            <div className="text-white text-lg font-mono font-bold tracking-widest leading-none">
                                                {cardNumber || '•••• •••• •••• ••••'}
                                            </div>
                                            <div className="flex justify-between items-end text-white/80">
                                                <div className="text-[10px] font-bold tracking-wider truncate max-w-[70%] uppercase">
                                                    {cardName || 'KART SAHİBİ'}
                                                </div>
                                                <div className="text-[10px] font-mono font-bold tracking-widest">
                                                    {expiryDate || 'AA/YY'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Girdileri */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Kart Sahibi *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="AD SOYAD"
                                                value={cardName}
                                                onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                                className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors uppercase"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Kart Numarası *</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="0000 0000 0000 0000"
                                                value={cardNumber}
                                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                                maxLength="19"
                                                className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Son Kullanma *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="AA/YY"
                                                    value={expiryDate}
                                                    onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                                                    maxLength="5"
                                                    className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors text-center"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5">CVV *</label>
                                                <input
                                                    type="password"
                                                    required
                                                    placeholder="000"
                                                    value={cvv}
                                                    onChange={(e) => setCvv(formatCvv(e.target.value))}
                                                    maxLength="3"
                                                    className="w-full bg-zinc-800 border border-zinc-700/60 rounded-xl px-4 py-3 text-white text-sm font-semibold focus:outline-none focus:border-amber-500 transition-colors text-center font-mono"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 pt-2">
                                        <button
                                            type="submit"
                                            disabled={paymentLoading}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
                                        >
                                            {paymentLoading ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Ödeme Onaylanıyor...
                                                </>
                                            ) : (
                                                '49.90 ₺ Öde ve Yükselt'
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowCheckout(false)}
                                            className="w-full py-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-sm transition-all"
                                        >
                                            Geri Dön
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
