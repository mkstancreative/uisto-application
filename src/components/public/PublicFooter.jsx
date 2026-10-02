import React from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { BRAND_NAME, BRAND_ORG } from './brand';

const FOOTER_COLUMNS = [
  {
    title: 'Careers',
    links: [
      ['Open Vacancies', '/careers'],
      ['Track Application', '/track'],
    ],
  },
  {
    title: 'Company',
    links: [
      ['About Us', '/#about'],
      ['Features', '/#features'],
      ['Testimonials', '/#resources'],
    ],
  },
  {
    title: 'Platform',
    links: [
      ['Home', '/'],
      ['Workflow', '/#workflow'],
    ],
  },
];

function PublicFooter({ onLogin }) {
  const year = new Date().getFullYear();
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="lp-footer-brand">
          <div className="lp-brand">
            <img src="/logo.png" alt="" className="lp-brand-logo" />
            <span>{BRAND_NAME}</span>
          </div>
          <p>
            A complete recruitment platform that helps the university hire the
            right people, faster.
          </p>
          <button className="lp-btn lp-btn-lime" onClick={onLogin}>
            Staff Login
          </button>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title} className="lp-footer-col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="lp-footer-bottom">
        <span>
          &copy; {year} {BRAND_ORG}
        </span>
        <span className="lp-footer-badge">
          <Users size={13} /> Recruitment Portal
        </span>
      </div>
    </footer>
  );
}

export default PublicFooter;
