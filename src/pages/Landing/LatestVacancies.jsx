import React from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useVacancies } from '../../hooks/useCareers';
import VacancyCard, { VacancyCardSkeleton } from '../Public/Careers/VacancyCard';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: 'easeOut' } },
};

const inView = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, amount: 0.15 },
};

/** The three newest open vacancies, shown near the top of the landing page. */
function LatestVacancies() {
  const { data, isLoading, isError } = useVacancies({ page: 1, limit: 3 });

  if (isError) return null;

  const jobs = Array.isArray(data?.data) ? data.data.slice(0, 3) : [];

  return (
    <section id="vacancies" className="lp-section lp-section-mist">
      <motion.div className="lp-section-head split" variants={fadeUp} {...inView}>
        <h2>
          Latest Open <br />
          Vacancies
        </h2>
        <p>
          Explore the newest roles at the university and apply online in minutes. No account
          needed.
        </p>
      </motion.div>

      <div className="lpv-inner">
        {isLoading ? (
          <div className="lpv-grid" aria-busy="true">
            {Array.from({ length: 3 }).map((_, i) => (
              <VacancyCardSkeleton key={i} />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="lpv-empty">
            There are no open vacancies at the moment. New roles are published regularly — please
            check back soon.
          </p>
        ) : (
          <div className="lpv-grid">
            {jobs.map((job) => (
              <motion.div key={job._id ?? job.id} className="lpv-item" variants={fadeUp} {...inView}>
                <VacancyCard job={job} />
              </motion.div>
            ))}
          </div>
        )}

        <div className="lpv-footer">
          <Link to="/careers" className="lp-btn lp-btn-teal lg">
            View all vacancies <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default LatestVacancies;
