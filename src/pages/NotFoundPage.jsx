// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowLeft, Compass, Home } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './NotFoundPage.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="nfp-root">
      {/* Ambient orbs */}
      <div className="nfp-orb nfp-orb-1" />
      <div className="nfp-orb nfp-orb-2" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="nfp-inner"
      >
        {/* Floating icon */}
        <motion.div variants={itemVariants} className="nfp-icon-wrap">
          <motion.div
            animate={{ rotate: [0, 8, -8, 0], y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="nfp-icon-box"
          >
            <Compass className="nfp-icon" strokeWidth={1.5} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.08, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity }}
            className="nfp-pulse-ring"
          />
        </motion.div>

        {/* 404 numeral */}
        <motion.div variants={itemVariants} className="nfp-number-wrap">
          <span className="nfp-number">404</span>
        </motion.div>

        {/* Heading */}
        <motion.h1 variants={itemVariants} className="nfp-heading">
          Page Not Found
        </motion.h1>

        <motion.p variants={itemVariants} className="nfp-sub">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </motion.p>

        {/* CTA buttons */}
        <motion.div variants={itemVariants} className="nfp-actions">
          <button onClick={() => navigate(-1)} className="nfp-btn-secondary">
            <ArrowLeft size={16} />
            Go Back
          </button>
          <Link to="/" className="nfp-btn-primary">
            <Home size={16} />
            Return Home
          </Link>
        </motion.div>

        {/* URL pill */}
        <motion.div variants={itemVariants} className="nfp-url-pill">
          <span className="nfp-url-method">GET</span>
          <span className="nfp-url-path">{window.location.pathname}</span>
          <span className="nfp-url-status">404</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
