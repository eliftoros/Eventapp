import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Users, Plus, Star, CheckCircle, X, Loader2 } from 'lucide-react';

export default function Home() {
    const { user, refreshUser } = useAuth();
    const [events, setEvents] = useState([]);
    const [cities, setCities] = useState([]);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [cardName, setCardName] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);

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

    const joinEvent = async (id) => {
        if (!user) return alert('Please login to join');
        
        const joinedEventsCount = events.filter(isParticipant).length;
        if (!user?.isPremium && joinedEventsCount >= 3) {
            setShowPremiumModal(true);
            return;
        }

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
                        className={`card group hover:scale-[1.02] transition-all duration-300 relative ${event.user?.isPremium ? 'border-2 border-amber-500/30 shadow-lg shadow-amber-500/5' : ''}`}
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
                            <div className="flex gap-2">
                                <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {event.city?.name || 'Online'}
                                </span>
                                {event.user?.isPremium && (
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> Featured
                                    </span>
                                )}
                            </div>
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
                                            Ücretsiz paketinizin limitine ulaştınız (3 Etkinlik). Sınırsız etkinliğe katılım ve VIP ayrıcalıklar için hemen Premium'a geçin!
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                                            <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span className="text-sm text-zinc-300 font-medium">Sınırsız etkinliğe katılım hakkı</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-800/40 rounded-xl border border-zinc-800/60">
                                            <CheckCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                            <span className="text-sm text-zinc-300 font-medium">VIP etkinliklere öncelikli erken kayıt</span>
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
                                        Aylık Sadece 49.90 ₺
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
