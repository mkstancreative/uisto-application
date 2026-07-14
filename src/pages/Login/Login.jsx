import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  FaBookOpenReader,
  FaGalacticRepublic,
  FaGraduationCap,
  FaRobot,
  FaTachographDigital,
} from "react-icons/fa6";
import { VscLaw } from "react-icons/vsc";
import LoginForm from "./LoginForm";
import "./Login.css";

/* ── Animation variants ── */
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.2, delayChildren: 0.3 },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -80 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 70, damping: 15 },
  },
};

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 18 },
  },
};

/* ── Random floating dots (stable — generated once at module level) ── */
const DOTS = Array.from({ length: 28 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  w: Math.random() * 3 + 1,
  dur: Math.random() * 14 + 8,
  del: Math.random() * 6,
  opa: Math.random() * 0.3 + 0.08,
}));

/* ── Feature cards data ── */
const FEATURES = [
  {
    title: "Learn Anywhere, Anytime",
    desc: "Access course materials, assignments, and grades from any device, at any time.",
    icon: <FaBookOpenReader />,
  },
  {
    title: "Streamlined Administration",
    desc: "Manage student records, enrollment tracking, performance monitoring, and profiles.",
    icon: <FaGraduationCap />,
  },
  {
    title: "Accredited Degrees",
    desc: "Earn degrees from accredited programs recognized by the Nigerian government.",
    icon: <VscLaw />,
  },
  {
    title: "AI-Powered Support",
    desc: "Get instant help with course materials, assignments, and grades.",
    icon: <FaRobot />,
  },
  {
    title: "Virtual Campus",
    desc: "Experience a fully immersive virtual campus with interactive classrooms, labs, and libraries.",
    icon: <FaTachographDigital />,
  },
  {
    title: "Global Recognition",
    desc: "Earn degrees from accredited programs recognized by the Nigerian government.",
    icon: <FaGalacticRepublic />,
  },
];

const Login = () => {
  return (
    <div className="login-container">
      {/* ── Optimized moving-grid overlay ── */}
      <div className="login-grid-overlay" />

      {/* ── Layered aurora blobs (CSS animated) ── */}
      <div className="login-aurora">
        <div className="aurora-blob aurora-blob-1" />
        <div className="aurora-blob aurora-blob-2" />
        <div className="aurora-blob aurora-blob-3" />
        <div className="aurora-blob aurora-blob-4" />
        <div className="aurora-blob aurora-blob-5" />
      </div>

      {/* ── Floating gold particles (CSS animated) ── */}
      <div className="login-particles">
        {DOTS.map((d) => (
          <div
            key={d.id}
            className="login-particle"
            style={{
              left: d.left,
              top: d.top,
              width: d.w,
              height: d.w,
              "--p-dur": `${d.dur}s`,
              "--p-del": `${d.del}s`,
              "--p-opa": d.opa,
            }}
          />
        ))}
      </div>

      {/* ── Background glows (CSS animated) ── */}
      <div className="bg-glow" />
      <div className="bg-glow-gold" />

      {/* ── Horizontal light-ray sweeps ── */}
      <div className="login-ray login-ray-1" />
      <div className="login-ray login-ray-2" />

      {/* ── Main two-column layout ── */}
      <motion.div
        className="main-content"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* Left — brand section */}
        <motion.div variants={slideLeft} className="brand-section">
          <div className="logo-placeholder">
            <img src="/logo.png" alt="University Logo" className="logo" />
          </div>

          <h1 className="university-name">
            The University of <span>Innovation</span> Science & Technology
          </h1>

          <p className="tagline">
            The next-generation academic superportal.
            <br />
            Learning Management System (LMS)
          </p>

          {/* Stats strip */}
          <div className="brand-stats">
            {[
              { val: "12K+", lbl: "Students" },
              { val: "340+", lbl: "Courses" },
              { val: "98%", lbl: "Uptime" },
            ].map((s, i) => (
              <motion.div
                key={s.lbl}
                className="brand-stat"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.15 }}
              >
                <span className="brand-stat-val">{s.val}</span>
                <span className="brand-stat-lbl">{s.lbl}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — login card */}
        <motion.div
          variants={slideUp}
          whileHover={{ y: -5 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="login-card-wrap"
        >
          {/* Spinning conic glow ring behind card */}
          <div className="card-glow-ring" />
          <LoginForm />
        </motion.div>
      </motion.div>

      {/* ── Feature cards ── */}
      <div className="features-grid">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.06, y: -8 }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 12,
              delay: index * 0.15,
            }}
            viewport={{ once: true }}
            className="feature-card"
          >
            <div className="feature-icon">{feature.icon}</div>
            <h3>{feature.title}</h3>
            <p>{feature.desc}</p>
            <div className="feature-card-line" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Login;
