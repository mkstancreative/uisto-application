/* Set VITE_APP_NAME / VITE_APP_TAGLINE in .env to rebrand the site. */
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Netpro';
export const APP_TAGLINE = import.meta.env.VITE_APP_TAGLINE || 'Recruitment Portal';
export const BRAND_NAME = `${APP_NAME} ${APP_TAGLINE}`;
export const BRAND_ORG = BRAND_NAME;
    
/* Email domain used in form placeholders, e.g. you@uisto.edu.ng */
export const EMAIL_DOMAIN = import.meta.env.VITE_EMAIL_DOMAIN || 'uisto.edu.ng';
export const EMAIL_PLACEHOLDER = `you@${EMAIL_DOMAIN}`;
