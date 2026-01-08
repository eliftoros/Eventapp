import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('USER');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(name, email, password, role);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
            >
                <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
                {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Full Name</label>
                        <input
                            type="text"
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1">Account Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setRole('USER')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'USER'
                                    ? 'border-blue-500 bg-blue-500/10 text-white'
                                    : 'border-zinc-800 bg-surface text-zinc-400 hover:border-zinc-700'
                                    }`}
                            >
                                Participant
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole('ORGANIZER')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${role === 'ORGANIZER'
                                    ? 'border-violet-500 bg-violet-500/10 text-white'
                                    : 'border-zinc-800 bg-surface text-zinc-400 hover:border-zinc-700'
                                    }`}
                            >
                                Organizer
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="w-full btn-primary py-2.5 mt-2">
                        Create Account
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-zinc-500">
                    Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300">Log in</Link>
                </p>
            </motion.div>
        </div>
    );
}
