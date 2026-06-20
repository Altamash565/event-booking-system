import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!emailOrUsername || !password) {
      toast.error('Please fill in all fields');
      setLoading(false);
      return;
    }

    const res = await login(emailOrUsername, password);
    setLoading(false);

    if (res.success) {
      toast.success('Signed in successfully');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen pt-16 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-card border border-border rounded-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Sign In</h1>
            <p className="text-sm text-muted-foreground">Sign in to book event tickets</p>
          </div>
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="emailOrUsername" className="text-sm font-medium text-foreground">
                Email or Username
              </label>
              <input
                type="text"
                id="emailOrUsername"
                placeholder="name@example.com"
                className="w-full border border-border rounded-md py-2.5 px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full border border-border rounded-md py-2.5 px-3 text-sm text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary placeholder:text-muted-foreground/50 transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground text-sm font-medium py-2.5 rounded-md transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Login;
