import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Plus, MapPin, Building, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('events');
    const [cities, setCities] = useState([]);
    const [locations, setLocations] = useState([]);
    const [categories, setCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [categoryName, setCategoryName] = useState('');

    // Forms state
    const [cityName, setCityName] = useState('');
    const [locationAddress, setLocationAddress] = useState('');
    const [locationCityId, setLocationCityId] = useState('');

    const [eventData, setEventData] = useState({
        name: '',
        description: '',
        date: '',
        categoryId: 1,
        cityId: '',
        locationId: ''
    });

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const [citiesRes, locationsRes, categoriesRes, usersRes] = await Promise.all([
                api.get('/cities'),
                api.get('/locations'),
                api.get('/categories'),
                api.get('/users')
            ]);

            setCities(citiesRes.data);
            setLocations(locationsRes.data);
            setCategories(categoriesRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const createCity = async (e) => {
        e.preventDefault();
        try {
            await api.post('/cities', { name: cityName });
            setCityName('');
            fetchMetadata();
            alert('City created!');
        } catch (err) {
            alert('Failed to create city');
        }
    };

    const createLocation = async (e) => {
        e.preventDefault();
        try {
            await api.post('/locations', { address: locationAddress, cityId: Number(locationCityId) });
            setLocationAddress('');
            setLocationCityId('');
            fetchMetadata();
            alert('Location created!');
        } catch (err) {
            alert('Failed to create location');
        }
    };

    const createCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', { name: categoryName });
            setCategoryName('');
            fetchMetadata();
            alert('Category created!');
        } catch (err) {
            alert('Failed to create category');
        }
    };

    const createEvent = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', {
                ...eventData,
                categoryId: Number(eventData.categoryId),
                cityId: Number(eventData.cityId),
                locationId: eventData.locationId ? Number(eventData.locationId) : undefined
            });
            alert('Event created!');
            setEventData({ name: '', description: '', date: '', categoryId: 1, cityId: '', locationId: '' });
        } catch (err) {
            console.error(err);
            alert('Failed to create event');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Organizer Dashboard</h1>

            <div className="flex gap-4 border-b border-zinc-800 pb-1">
                {['events', 'users', 'cities', 'locations', 'categories']
                    .map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
            </div>

            <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card"
            >
                {activeTab === 'cities' && (
                    <form onSubmit={createCity} className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Building className="w-5 h-5 text-blue-500" /> Add New City
                        </h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="City Name"
                                className="input-field flex-1"
                                value={cityName}
                                onChange={(e) => setCityName(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">Add City</button>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-3">Existing Cities</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {cities.map(city => (
                                    <div key={city.id} className="p-3 bg-zinc-900 rounded border border-zinc-800">
                                        {city.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            User Management
                        </h2>
                        <div className="space-y-2">
                            {users.map(user => (
                                <div key={user.id} className="p-4 bg-zinc-900 rounded border border-zinc-800 flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold">{user.name}</div>
                                        <div className="text-sm text-zinc-500">{user.email}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={user.role}
                                            onChange={async (e) => {
                                                try {
                                                    await api.patch(`/users/${user.id}/role`, { role: e.target.value });
                                                    fetchMetadata();
                                                    alert('Role updated successfully!');
                                                } catch (err) {
                                                    alert('Failed to update role');
                                                }
                                            }}
                                            className="input-field text-sm"
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ORGANIZER">ORGANIZER</option>
                                        </select>
                                        <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider ${user.role === 'ORGANIZER' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                'bg-zinc-700/50 text-zinc-400 border border-zinc-600/20'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'categories' && (
                    <form onSubmit={createCategory} className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Add New Category
                        </h2>
                        <div className="flex gap-4">
                            <input
                                type="text"
                                placeholder="Category Name"
                                className="input-field flex-1"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                            />
                            <button type="submit" className="btn-primary">Add Category</button>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-3">Existing Categories</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {categories.map(cat => (
                                    <div key={cat.id} className="p-3 bg-zinc-900 rounded border border-zinc-800">
                                        {cat.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === 'locations' && (
                    <form onSubmit={createLocation} className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-violet-500" /> Add New Location
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <select
                                className="input-field"
                                value={locationCityId}
                                onChange={(e) => setLocationCityId(e.target.value)}
                                required
                            >
                                <option value="">Select City</option>
                                {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
                            </select>
                            <input
                                type="text"
                                placeholder="Address"
                                className="input-field"
                                value={locationAddress}
                                onChange={(e) => setLocationAddress(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="btn-primary w-full md:w-auto">Add Location</button>

                        <div className="mt-8">
                            <h3 className="text-lg font-semibold mb-3">Existing Locations</h3>
                            <div className="space-y-2">
                                {locations.map(loc => (
                                    <div key={loc.id} className="p-3 bg-zinc-900 rounded border border-zinc-800 flex justify-between">
                                        <span>{loc.address}</span>
                                        <span className="text-zinc-500 text-sm">{loc.city?.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                )}

                {activeTab === 'events' && (
                    <form onSubmit={createEvent} className="space-y-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-pink-500" /> Create New Event
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                placeholder="Event Name"
                                className="input-field"
                                value={eventData.name}
                                onChange={(e) => setEventData({ ...eventData, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                className="input-field min-h-[100px]"
                                value={eventData.description}
                                onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="datetime-local"
                                    className="input-field"
                                    value={eventData.date}
                                    onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
                                    required
                                />
                                <select
                                    className="input-field"
                                    value={eventData.categoryId}
                                    onChange={(e) => setEventData({ ...eventData, categoryId: e.target.value })}
                                >
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select
                                    className="input-field"
                                    value={eventData.cityId}
                                    onChange={(e) => setEventData({ ...eventData, cityId: e.target.value })}
                                    required
                                >
                                    <option value="">Select City</option>
                                    {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <select
                                    className="input-field"
                                    value={eventData.locationId}
                                    onChange={(e) => setEventData({ ...eventData, locationId: e.target.value })}
                                >
                                    <option value="">Select Location (Optional)</option>
                                    {locations
                                        .filter(l => !eventData.cityId || l.cityId === Number(eventData.cityId))
                                        .map(l => <option key={l.id} value={l.id}>{l.address}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary w-full">Create Event</button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
