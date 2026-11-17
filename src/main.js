// SVN Engineering & General Works — site scripts
const WA_NUMBER = '27760518003';

const track = (name, params = {}) => {
  if (typeof window.gtag === 'function') window.gtag('event', name, params);
};

// Year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Sticky header shadow
const header = document.getElementById('header');
const onScroll = () => header && header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
const closeMenu = () => {
  nav.classList.remove('is-open');
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-label', 'Open menu');
  document.body.classList.remove('menu-open');
};
if (burger && nav) {
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (e) => e.key === 'Escape' && closeMenu());
}

// Reveal on scroll
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('is-visible'));
}

// Counters
const counters = document.querySelectorAll('[data-count]');
const runCounter = (el) => {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const start = performance.now();
  const dur = 1300;
  const step = (now) => {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
};
if ('IntersectionObserver' in window) {
  const co = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { runCounter(e.target); co.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((c) => co.observe(c));
} else {
  counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || '')));
}

// Active nav link
const sections = [...document.querySelectorAll('main section[id]')];
const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
if ('IntersectionObserver' in window && navLinks.length) {
  const so = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => so.observe(s));
}

// Conversion tracking on calls / WhatsApp clicks
document.querySelectorAll('a[href^="tel:"], a[href*="wa.me"]').forEach((a) => {
  a.addEventListener('click', () => {
    const type = a.href.startsWith('tel:') ? 'phone_call_click' : 'whatsapp_click';
    track(type, { link_location: a.dataset.track || 'other' });
  });
});

// Quote form -> WhatsApp
const form = document.getElementById('quoteForm');
const err = document.getElementById('formError');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const required = ['name', 'phone', 'type'];
    let ok = true;
    required.forEach((key) => {
      const field = form.elements[key];
      const bad = !String(data[key] || '').trim();
      field.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    err.hidden = ok;
    if (!ok) return;

    const lines = [
      'Hi SVN Engineering, I would like a quote.',
      '',
      `Name: ${data.name}`,
      `Phone: ${data.phone}`,
      data.company ? `Company: ${data.company}` : '',
      data.city ? `Location: ${data.city}` : '',
      `Interested in: ${data.type}`,
      data.message ? `Details: ${data.message}` : '',
    ].filter(Boolean);

    track('generate_lead', { method: 'quote_form_whatsapp', machine_type: data.type });
    window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    form.reset();
  });
  form.addEventListener('input', (e) => e.target.classList.remove('is-invalid'));
}
