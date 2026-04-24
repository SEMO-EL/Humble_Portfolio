/* ============================================================
   SIMO PORTFOLIO — JS
   ============================================================ */

// CURSOR
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');

let mouseX = 0, mouseY = 0;
let cursorX = 0, cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top = mouseY + 'px';
});

// Smooth cursor lag
function animateCursor() {
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;
  cursor.style.left = cursorX + 'px';
  cursor.style.top = cursorY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

// Cursor hover effect
document.querySelectorAll('a, button, .project-link, .agrid-item, .ws-space, .pc').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
});

// NAV SCROLL
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// SCROLL REVEAL
const reveals = document.querySelectorAll('.project, .about-body, .contact-title, .contact-links, .about-title, .about-desc');
reveals.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// SKILL BARS
const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.skill-fill').forEach((fill, i) => {
        setTimeout(() => fill.classList.add('animated'), i * 120);
      });
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const skillsGrid = document.querySelector('.skills-grid');
if (skillsGrid) skillObserver.observe(skillsGrid);

// SMOOTH ANCHOR SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

// GLITCH EFFECT on hero title hover
const titleLines = document.querySelectorAll('.title-line');
titleLines.forEach(line => {
  line.addEventListener('mouseenter', () => {
    line.style.transition = 'none';
    let i = 0;
    const glitch = setInterval(() => {
      line.style.transform = `translateX(${(Math.random() - 0.5) * 6}px) skewX(${(Math.random() - 0.5) * 2}deg)`;
      i++;
      if (i > 6) {
        clearInterval(glitch);
        line.style.transform = '';
        line.style.transition = '';
      }
    }, 40);
  });
});

// SVVVD TICKER ANIMATION
const ticker = document.querySelector('.svvvd-ticker');
if (ticker) {
  const text = ticker.textContent;
  ticker.textContent = text + ' ' + text;
  ticker.style.animation = 'ticker 12s linear infinite';
  const style = document.createElement('style');
  style.textContent = `
    @keyframes ticker {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `;
  document.head.appendChild(style);
}

// PROJECT HOVER — subtle color accent on number
document.querySelectorAll('.project').forEach(project => {
  const num = project.querySelector('.project-num');
  project.addEventListener('mouseenter', () => {
    if (num) num.style.color = 'var(--accent)';
  });
  project.addEventListener('mouseleave', () => {
    if (num) num.style.color = 'var(--fg3)';
  });
});

// STAGGER REVEAL for sections
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const children = entry.target.querySelectorAll('.astat, .agrid-item, .skill-block, .stack-row span, .project-tags span');
      children.forEach((child, i) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(12px)';
        child.style.transition = `opacity 0.5s ease ${i * 60}ms, transform 0.5s ease ${i * 60}ms`;
        setTimeout(() => {
          child.style.opacity = '1';
          child.style.transform = 'translateY(0)';
        }, 200 + i * 60);
      });
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.archeo-mock, .about-right, .project-info').forEach(el => {
  staggerObserver.observe(el);
});
