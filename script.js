/* ============================================================
   3D BOOK INTERACTION
   ============================================================ */
const book = document.getElementById('book');
const bookScene = document.getElementById('bookScene');
const bookDots = document.querySelectorAll('.book-dot');
const bookHint = document.getElementById('bookHint');

let isDragging = false;
let startX = 0;
let currentRotation = 0;
let targetRotation = 0;
let animFrame;
let activeIndex = 0;
let hintHidden = false;

// Snap to nearest 90deg face
function snapToFace(rot) {
  return Math.round(rot / 90) * 90;
}

function getActiveIndex(rot) {
  // Normalize rotation to 0-359
  let n = ((-rot % 360) + 360) % 360;
  return Math.round(n / 90) % 4;
}

function updateDots(index) {
  bookDots.forEach(d => d.classList.remove('active'));
  const active = document.querySelector(`.book-dot[data-i="${index}"]`);
  if (active) active.classList.add('active');
}

function animateToTarget() {
  currentRotation += (targetRotation - currentRotation) * 0.12;
  book.style.transform = `rotateY(${currentRotation}deg) rotateX(-6deg)`;
  const idx = getActiveIndex(currentRotation);
  if (idx !== activeIndex) {
    activeIndex = idx;
    updateDots(activeIndex);
  }
  if (Math.abs(targetRotation - currentRotation) > 0.05) {
    animFrame = requestAnimationFrame(animateToTarget);
  } else {
    currentRotation = targetRotation;
    book.style.transform = `rotateY(${currentRotation}deg) rotateX(-6deg)`;
  }
}

// MOUSE
bookScene.addEventListener('mousedown', (e) => {
  isDragging = true;
  startX = e.clientX;
  cancelAnimationFrame(animFrame);
  bookScene.style.cursor = 'grabbing';
  if (!hintHidden) {
    hintHidden = true;
    bookHint.classList.add('hidden');
  }
});

window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const dx = e.clientX - startX;
  targetRotation = currentRotation + dx * 0.5;
  book.style.transform = `rotateY(${targetRotation}deg) rotateX(-6deg)`;
  const idx = getActiveIndex(targetRotation);
  if (idx !== activeIndex) {
    activeIndex = idx;
    updateDots(activeIndex);
  }
});

window.addEventListener('mouseup', (e) => {
  if (!isDragging) return;
  isDragging = false;
  bookScene.style.cursor = 'grab';
  const dx = e.clientX - startX;
  // Snap + momentum
  let snap = snapToFace(targetRotation + dx * 0.3);
  targetRotation = snap;
  currentRotation = parseFloat(book.style.transform.match(/rotateY\(([^d]+)/)?.[1] || currentRotation);
  animateToTarget();
});

// TOUCH
bookScene.addEventListener('touchstart', (e) => {
  isDragging = true;
  startX = e.touches[0].clientX;
  cancelAnimationFrame(animFrame);
  if (!hintHidden) {
    hintHidden = true;
    bookHint.classList.add('hidden');
  }
}, { passive: true });

window.addEventListener('touchmove', (e) => {
  if (!isDragging) return;
  const dx = e.touches[0].clientX - startX;
  targetRotation = currentRotation + dx * 0.5;
  book.style.transform = `rotateY(${targetRotation}deg) rotateX(-6deg)`;
  const idx = getActiveIndex(targetRotation);
  if (idx !== activeIndex) {
    activeIndex = idx;
    updateDots(activeIndex);
  }
}, { passive: true });

window.addEventListener('touchend', (e) => {
  if (!isDragging) return;
  isDragging = false;
  const dx = e.changedTouches[0].clientX - startX;
  let snap = snapToFace(targetRotation + dx * 0.3);
  targetRotation = snap;
  currentRotation = targetRotation - dx * 0.3;
  animateToTarget();
});

// DOT CLICK — jump to face
bookDots.forEach(dot => {
  dot.addEventListener('click', () => {
    const i = parseInt(dot.dataset.i);
    targetRotation = -i * 90;
    // Shortest path
    while (targetRotation - currentRotation > 180) targetRotation -= 360;
    while (currentRotation - targetRotation > 180) targetRotation += 360;
    cancelAnimationFrame(animFrame);
    animateToTarget();
  });
});

// AUTO-ROTATE on idle (pauses when user interacts)
let autoRotateTimer;
function startAutoRotate() {
  autoRotateTimer = setInterval(() => {
    if (!isDragging) {
      targetRotation -= 90;
      cancelAnimationFrame(animFrame);
      animateToTarget();
    }
  }, 3000);
}
startAutoRotate();
bookScene.addEventListener('mousedown', () => clearInterval(autoRotateTimer));
bookScene.addEventListener('touchstart', () => clearInterval(autoRotateTimer), { passive: true });



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
      const children = entry.target.querySelectorAll('.astat, .agrid-item, .skill-block, .stack-row span, .project-tags span, .system-grid div');
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