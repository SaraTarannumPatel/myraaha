import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Rocket, Mail, Lock, Eye, EyeOff, Smartphone, ArrowRight } from 'lucide-react';
import './MobileLogin.css';

const MobileLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/redirect');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-login-page">
      <div className="login-header-mobile">
        <div className="login-logo-mobile">
          <Rocket size={32} />
          <span>ShuttlEx</span>
        </div>
        <h1>Welcome back</h1>
        <p>Sign in to continue your journey</p>
      </div>

      <div className="login-form-mobile">
        {error && <div className="login-error-mobile">{error}</div>}
        
        <form onSubmit={handleEmailLogin}>
          <div className="input-group-mobile">
            <label>Email address</label>
            <div className="input-with-icon">
              <Mail size={18} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="input-group-mobile">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Your password"
                required
              />
              <button 
                type="button" 
                className="eye-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="mobile-btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer-mobile">
          <p>Don't have an account?</p>
          <Link to="/auth/onboarding/welcome" className="btn-text-mobile">Get Started</Link>
        </div>
      </div>
    </div>
  );
};

export default MobileLogin;
