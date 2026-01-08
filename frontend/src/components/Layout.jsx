import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, User } from 'lucide-react';

export default function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <nav className="border-b border-zinc-800 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        EventApp
                    </Link>

                    <div className="flex items-center gap-6">
                        {user ? (
                            <>
                                <div className="flex items-center gap-4">
                                    {user.role === 'ORGANIZER' && (
                                        <Link to="/dashboard" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                            Dashboard
                                        </Link>
                                    )}
                                    {user.role === 'ORGANIZER' && (
                                        <Link to="/events" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                                            My Events
                                        </Link>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <User className="w-4 h-4" />
                                    <span className="text-sm font-medium text-white">{user.name}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 uppercase tracking-wider">{user.role}</span>
                                </div>
                                <button onClick={handleLogout} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2">
                                    <LogOut className="w-4 h-4" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Login</Link>
                                <Link to="/register" className="btn-primary text-sm shadow-lg shadow-blue-500/20">Get Started</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
