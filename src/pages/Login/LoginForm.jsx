import React, { useState } from 'react';
import { useLogin } from '../../hooks/useLogin';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { MdOutlineSecurity } from 'react-icons/md';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

import { toast } from 'react-toastify';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Please enter your credentials.');
      return;
    }

    login({
      username: username.trim(),
      password,
    });
  };

  return (
    <div className="login-card">
      <h2>Login to your account</h2>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <input
            type="text"
            placeholder="Email or Username"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
            }}
            disabled={isPending}
          />
        </div>

        <div className="input-group password-group">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            disabled={isPending}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <motion.button
          type="submit"
          className={`verify-btn${isPending ? ' loading' : ''}`}
          disabled={isPending}
        >
          {isPending ? (
            <span className="btn-loading">
              <Loader2 size={16} className="spin-icon" />
              Verifying…
            </span>
          ) : (
            'VERIFY & ENTER'
          )}
        </motion.button>
      </form>

      <div className="security-footer">
        <MdOutlineSecurity />
        <span>256-bit TLS • 2FA Ready • AI Monitoring</span>
      </div>
    </div>
  );
}

export default LoginForm;
