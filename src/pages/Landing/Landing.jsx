import React from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  CalendarCheck,
  ChevronDown,
  FileText,
  Layers,
  ListChecks,
  Menu,
  Plug,
  Sparkles,
  Star,
  UserCheck,
} from "lucide-react";
import PublicLayout from "../../components/public/PublicLayout";
import { BRAND_NAME } from "../../components/public/brand";
import LatestVacancies from "./LatestVacancies";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const inView = {
  initial: "hidden",
  whileInView: "show",
  viewport: { once: true, amount: 0.2 },
};

/* ════════════════════════════════════════
   HERO + DASHBOARD PREVIEW
════════════════════════════════════════ */
const PIPELINE = [62, 88, 45, 74, 58, 92, 40, 80];

function DashboardPreview() {
  return (
    <motion.div
      className="lp-preview"
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.35, ease: "easeOut" }}
    >
      <div className="lp-preview-bar">
        <div className="lp-brand lp-brand-sm">
          <img src="/logo.png" alt="" className="lp-brand-logo" />
          <span>{BRAND_NAME}</span>
        </div>
        <span className="lp-nav-divider" />
        <span className="lp-preview-link">Jobs</span>
        <span className="lp-preview-link">Applicants</span>
        <span className="lp-preview-link">Shortlist</span>
        <div className="lp-preview-bar-end">
          <span className="lp-chip-light">Admin</span>
          <span className="lp-dot-lime">
            <Menu size={12} />
          </span>
        </div>
      </div>

      <div className="lp-preview-grid">
        <div className="lp-card lp-card-analytics">
          <h4>Hiring Analytics</h4>
          <div className="lp-donut">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="46" className="lp-donut-track" />
              <circle cx="60" cy="60" r="46" className="lp-donut-value" />
            </svg>
            <span className="lp-donut-label">90%</span>
            <span className="lp-float-tag lp-float-tr">+1,240</span>
            <span className="lp-float-tag lp-float-bl">Roles 48</span>
          </div>
        </div>

        <div className="lp-card lp-card-chart">
          <div className="lp-card-head">
            <h4>Applicant Pipeline</h4>
            <span className="lp-select">
              2026 <ChevronDown size={14} />
            </span>
          </div>
          <div className="lp-bars">
            {PIPELINE.map((h, i) => (
              <div key={i} className="lp-bar-col">
                <motion.span
                  className="lp-bar"
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 0.9, delay: 0.7 + i * 0.07 }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="lp-card lp-card-stat">
          <span className="lp-stat-val">98%</span>
          <span className="lp-stat-title">Screened</span>
          <p>Applications reviewed and scored against role requirements.</p>
        </div>

        <div className="lp-card lp-card-point">
          <Sparkles size={30} className="lp-point-icon" />
          <h5>Important Point</h5>
          <p>Visualize applicant data and hiring progress with clear analytics.</p>
        </div>

        <div className="lp-card lp-card-people">
          <div className="lp-card-head">
            <h4>Shortlisted Today</h4>
            <span className="lp-chip-lime">12 new</span>
          </div>
          <ul className="lp-people">
            {[
              ["AO", "Senior Lecturer", "Academic"],
              ["CN", "Systems Analyst", "Non-Academic"],
              ["FB", "Lab Technologist", "Technical"],
            ].map(([ini, role, cadre]) => (
              <li key={ini}>
                <span className="lp-avatar">{ini}</span>
                <div>
                  <strong>{role}</strong>
                  <span>{cadre}</span>
                </div>
                <UserCheck size={16} className="lp-people-check" />
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-card lp-card-schedule">
          <CalendarCheck size={22} />
          <span className="lp-stat-val sm">24</span>
          <p>Interviews scheduled this week</p>
        </div>
      </div>
    </motion.div>
  );
}

function Hero() {
  return (
    <section id="home" className="lp-hero">
      <motion.div className="lp-hero-copy" variants={stagger} initial="hidden" animate="show">
        <motion.h1 variants={fadeUp}>
          Smart Recruitment Platform For Growing Institutions
        </motion.h1>
        <motion.p variants={fadeUp}>
          Simplify your hiring with one platform to publish vacancies, track
          applicants, shortlist candidates and report on every stage of the
          recruitment process.
        </motion.p>
        <motion.div variants={fadeUp} className="lp-hero-actions">
          <Link to="/careers" className="lp-btn lp-btn-light lg">
            View Open Vacancies
          </Link>
          <Link to="/track" className="lp-btn lp-btn-outline lg">
            Track Application
          </Link>
        </motion.div>
      </motion.div>

      <DashboardPreview />
    </section>
  );
}

/* ════════════════════════════════════════
   FEATURES
════════════════════════════════════════ */
function Features() {
  return (
    <section id="features" className="lp-section lp-section-white">
      <motion.div className="lp-section-head split" variants={fadeUp} {...inView}>
        <h2>
          Everything You Need To <br />
          Manage Your Recruitment
        </h2>
        <p>
          A complete set of tools designed to help your institution attract,
          evaluate and hire the right people efficiently.
        </p>
      </motion.div>

      <motion.div className="lp-feature-grid" variants={stagger} {...inView}>
        <motion.article variants={fadeUp} className="lp-feature lp-feature-docs">
          <h3>Job Postings</h3>
          <p>Create vacancies by cadre, sub-cadre and position with clear requirements in one place.</p>
          <div className="lp-doc-stack">
            <div className="lp-doc">
              <FileText size={18} />
              <div>
                <strong>Senior Lecturer</strong>
                <span>Faculty of Science</span>
              </div>
              <span className="lp-chip-lime">Open</span>
            </div>
            <div className="lp-doc">
              <BriefcaseBusiness size={18} />
              <div>
                <strong>ICT Officer</strong>
                <span>Non-Academic</span>
              </div>
              <span className="lp-chip-light">Draft</span>
            </div>
          </div>
        </motion.article>

        <motion.article variants={fadeUp} className="lp-feature lp-feature-chart">
          <span className="lp-eyebrow">Track every stage</span>
          <h3>Applicant Tracking</h3>
          <div className="lp-pill-bars">
            {[48, 72, 100, 82].map((h, i) => (
              <span key={i} className={`lp-pill-bar${i === 1 ? " white" : ""}`} style={{ height: `${h}%` }} />
            ))}
          </div>
          <span className="lp-chart-caption">new applicants</span>
        </motion.article>

        <motion.article variants={fadeUp} className="lp-feature lp-feature-report">
          <div className="lp-report-visual">
            <div className="lp-report-ring">
              <span>85%</span>
            </div>
            <div className="lp-report-lines">
              <span style={{ width: "90%" }} />
              <span style={{ width: "70%" }} />
              <span style={{ width: "80%" }} />
            </div>
          </div>
          <h3>Shortlisting &amp; Reports</h3>
          <p>Shortlist qualified candidates and export detailed reports on every application.</p>
        </motion.article>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════
   ABOUT / ONBOARDING
════════════════════════════════════════ */
function About() {
  return (
    <section id="about" className="lp-section lp-section-mist">
      <div className="lp-about">
        <motion.div className="lp-about-copy" variants={fadeUp} {...inView}>
          <h2>Seamless Candidate Evaluation</h2>
          <p>
            Give every applicant a fair, consistent review. Requirements,
            documents and status updates live together so your panel can make
            confident decisions faster.
          </p>
        </motion.div>

        <motion.div className="lp-about-grid" variants={stagger} {...inView}>
          <motion.div variants={fadeUp} className="lp-teal-card">
            <h3>Structured Reviews</h3>
            <p>
              Score applicants against role requirements, update their status
              and keep a clear record of every decision.
            </p>
            <p>Ensure every candidate completes the required steps.</p>
            <Link to="/careers" className="lp-btn lp-btn-light">
              Browse Vacancies
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="lp-teal-card lp-metric-card">
            <span className="lp-stat-val">85.46%</span>
            <h3>Hiring Efficiency Metrics</h3>
            <p>Monitor time-to-shortlist and applicant progress across every vacancy.</p>
            <div className="lp-metric-bars">
              {[40, 65, 52, 80, 70, 95].map((h, i) => (
                <span key={i} style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   WORKFLOW AUTOMATION
════════════════════════════════════════ */
function Workflow() {
  return (
    <section id="workflow" className="lp-section lp-section-white">
      <div className="lp-workflow">
        <motion.div className="lp-workflow-copy" variants={fadeUp} {...inView}>
          <h2>
            Automate Your <br /> Hiring Workflow
          </h2>
          <div className="lp-quote-line">
            <p>
              Connect your recruitment process end to end, from vacancy to
              shortlist, and remove repetitive manual steps that slow your team down.
            </p>
            <p>
              Build reports tailored to your institution and track applications
              in real time.
            </p>
          </div>
          <Link to="/careers" className="lp-btn lp-btn-teal">
            See Open Roles <ArrowRight size={16} />
          </Link>
        </motion.div>

        <motion.div className="lp-workflow-visual" variants={stagger} {...inView}>
          <motion.div variants={fadeUp} className="lp-window">
            <div className="lp-window-bar">
              <span className="lp-window-dots">
                <i /> <i /> <i />
              </span>
              <span>Workflow Automation</span>
              <Menu size={14} />
            </div>
            <div className="lp-window-body">
              <ul className="lp-flow-list">
                {[
                  [<Plug size={16} />, "Applicant Imports"],
                  [<Layers size={16} />, "Custom Stages"],
                  [<Bell size={16} />, "Smart Notifications"],
                ].map(([icon, label], i) => (
                  <li key={label} className={i === 0 ? "active" : ""}>
                    <span className="lp-flow-icon">{icon}</span>
                    {label}
                  </li>
                ))}
              </ul>
              <div className="lp-window-side">
                <div className="lp-window-avatars">
                  {["AO", "CN", "FB"].map((a) => (
                    <span key={a} className="lp-avatar">
                      {a}
                    </span>
                  ))}
                </div>
                <p>Design workflows that match your institution's processes.</p>
              </div>
            </div>
          </motion.div>

          <div className="lp-workflow-row">
            <motion.div variants={fadeUp} className="lp-teal-card lp-mini-stat">
              <span className="lp-mini-line" />
              <span className="lp-stat-val">85%</span>
              <span>Workflow Automation</span>
            </motion.div>
            <motion.div variants={fadeUp} className="lp-teal-card lp-mini-list">
              <ListChecks size={20} />
              <div>
                <strong>Auto-shortlist rules</strong>
                <span>Match candidates to requirements instantly</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ════════════════════════════════════════
   TESTIMONIALS
════════════════════════════════════════ */
const TESTIMONIALS = [
  {
    initials: "HR",
    role: "Head of Human Resources",
    text: "Our hiring process is now organised in one place. Publishing roles and reviewing applicants is simple and fast.",
    stars: 5,
  },
  {
    initials: "RG",
    role: "Registry Officer",
    text: "Before this platform, applications were scattered across email and spreadsheets. Now everything from vacancy to shortlist is centralised.",
    stars: 5,
  },
  {
    initials: "DN",
    role: "Dean, Faculty of Science",
    text: "We can see every applicant for our department and shortlist the right candidates in a fraction of the time.",
    stars: 4,
  },
  {
    initials: "IC",
    role: "ICT Unit Lead",
    text: "Reports on applicants, cadres and positions give management a clear view of recruitment progress.",
    stars: 5,
  },
];

function Testimonials() {
  return (
    <section id="resources" className="lp-section lp-section-white">
      <motion.div className="lp-trust" variants={fadeUp} {...inView}>
        <div className="lp-trust-head">
          <h2>Trusted By Hiring Teams</h2>
          <p>
            Departments across the university rely on the platform to manage
            recruitment efficiently and transparently.
          </p>
        </div>
        <motion.div className="lp-trust-grid" variants={stagger} {...inView}>
          {TESTIMONIALS.map((t) => (
            <motion.figure key={t.role} variants={fadeUp} className="lp-quote">
              <figcaption>
                <span className="lp-avatar lg">{t.initials}</span>
                <strong>{t.role}</strong>
              </figcaption>
              <blockquote>{t.text}</blockquote>
              <div className="lp-stars" aria-label={`${t.stars} out of 5 stars`}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} size={15} />
                ))}
              </div>
            </motion.figure>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════
   CTA + FOOTER
════════════════════════════════════════ */
function CallToAction() {
  return (
    <section className="lp-section lp-section-white lp-cta-wrap">
      <motion.div className="lp-cta" variants={fadeUp} {...inView}>
        <h2>Ready To Join Our Team?</h2>
        <p>Browse open vacancies and apply online in minutes. No account needed.</p>
        <Link to="/careers" className="lp-btn lp-btn-lime lg">
          View Open Vacancies <ArrowRight size={16} />
        </Link>
      </motion.div>
    </section>
  );
}

/* ════════════════════════════════════════
   PAGE
════════════════════════════════════════ */
const Landing = () => (
  <PublicLayout hero={<Hero />}>
    <LatestVacancies />
    <Features />
    <About />
    <Workflow />
    <Testimonials />
    <CallToAction />
  </PublicLayout>
);

export default Landing;
