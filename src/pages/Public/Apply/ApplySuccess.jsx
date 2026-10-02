import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, CheckCircle2, Copy, MailCheck, TriangleAlert } from 'lucide-react';
import { toast } from 'react-toastify';

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* Fallback for older browsers / insecure contexts */
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

function ApplySuccess({ applicationId, email, jobTitle, message }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!applicationId) return;
    if (await copyText(applicationId)) {
      setCopied(true);
      toast.success('Application ID copied');
      setTimeout(() => setCopied(false), 2500);
    } else {
      toast.error('Could not copy automatically — please write the ID down.');
    }
  };

  const trackUrl = `/track?${new URLSearchParams({
    ...(applicationId ? { applicationId } : {}),
    ...(email ? { email } : {}),
  })}`;

  return (
    <div className="ap-success">
      <span className="ap-success-icon">
        <CheckCircle2 size={34} />
      </span>
      <h2>Application submitted</h2>
      <p className="ap-success-lead">
        {message || 'Your application has been received.'}
        {jobTitle && (
          <>
            {' '}
            Thank you for applying for <strong>{jobTitle}</strong>.
          </>
        )}
      </p>

      <div className="ap-id-card">
        <span className="ap-id-label">Your application ID</span>
        <div className="ap-id-row">
          <code className="ap-id" aria-live="polite">
            {applicationId || 'Not available'}
          </code>
          {applicationId && (
            <button type="button" className="lp-btn lp-btn-lime" onClick={copy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>

      <div className="lp-form-alert warning ap-success-warn" role="note">
        <TriangleAlert size={16} />
        <span>
          <strong>Keep this ID safe.</strong> It is the only way to track your application — together
          with the email address you applied with. Copy it, screenshot it or write it down now.
        </span>
      </div>

      <div className="ap-success-next">
        <MailCheck size={18} />
        <p>
          Your three referees will now receive an email with a link to submit their reference. You
          may also receive emails from us about the next stages.
        </p>
      </div>

      <div className="ap-success-actions">
        <Link to={trackUrl} className="lp-btn lp-btn-teal lg">
          Track your application <ArrowRight size={16} />
        </Link>
        <Link to="/careers" className="pub-btn-ghost">
          Browse other vacancies
        </Link>
      </div>
    </div>
  );
}

export default ApplySuccess;
