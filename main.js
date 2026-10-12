/* ═══════════════════════════════════════════════════════════
   FAJAR NUR FARRIJAL — Portfolio JS v4 (Optimized)
   ═══════════════════════════════════════════════════════════ */
'use strict';

// Shared lerp utility
const lerp = (a, b, t) => a + (b - a) * t;

// Shared mouse state (single mousemove listener)
const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
  mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

// ── CUSTOM CURSOR (disabled — using default browser cursor) ──────
(function () {
  // Custom cursor disabled; browser default cursor is active
})();

// ── NAVBAR ────────────────────────────────────────────────
(function () {
  const nav = document.getElementById('navbar');
  const links = document.querySelectorAll('.nav-link');
  const ham = document.getElementById('hamburger');
  const nl = document.getElementById('nav-links');
  if (!nav) return;

  let sections = [];
  const cacheSections = () => {
    sections = Array.from(document.querySelectorAll('section[id]')).map(s => ({ id: s.id, top: s.offsetTop }));
  };
  cacheSections();
  window.addEventListener('resize', cacheSections, { passive: true });

  let lastScrollY = -1;
  window.addEventListener('scroll', () => {
    const sy = window.scrollY;
    if (Math.abs(sy - lastScrollY) < 2) return;
    lastScrollY = sy;
    nav.classList.toggle('scrolled', sy > 40);
    let current = '';
    for (const s of sections) { if (sy >= s.top - 120) current = s.id; }
    if (sy < 200) current = 'home';
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
  }, { passive: true });

  ham && ham.addEventListener('click', () => nl.classList.toggle('open'));

  links.forEach(l => {
    l.addEventListener('click', () => nl && nl.classList.remove('open'));
  });

  const navInner = nav.querySelector('.nav-inner');
  if (navInner) {
    navInner.addEventListener('mousemove', e => {
      const rect = navInner.getBoundingClientRect();
      const pctX = ((e.clientX - rect.left) / rect.width) * 100;
      navInner.style.setProperty('--nav-mouse-x', `${pctX}%`);
    }, { passive: true });
    navInner.addEventListener('mouseleave', () => {
      navInner.style.setProperty('--nav-mouse-x', '50%');
    });
  }
})();

// ── SMOOTH SCROLL (Home navigates to the very top) ────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href) return;
    e.preventDefault();

    if (href === '#home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (history.pushState) {
        history.pushState(null, null, '#home');
      }
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (history.pushState) {
      history.pushState(null, null, href);
    }
  });
});

// ── SCROLL REVEAL ─────────────────────────────────────────
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = (i % 5) * 90 + 'ms';
        e.target.classList.add('visible');
        io.unobserve(e.target); // Stop observing once revealed
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ── 3D REVOLVING CYLINDER CAROUSEL (LEONARDO.AI STYLE) ───
(function () {
  const stage = document.getElementById('cylinder-stage');
  const drum  = document.getElementById('cylinder-drum');
  const prevBtn = document.getElementById('cyl-prev');
  const nextBtn = document.getElementById('cyl-next');
  if (!stage || !drum) return;

  const panels = Array.from(drum.querySelectorAll('.cylinder-panel'));
  const total = panels.length;
  const stepAngle = 360 / total; // 45 deg

  let currentAngle = 0;
  let targetAngle = 0;
  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let velocity = 0;
  let isHovered = false;
  let autoRotateSpeed = 0.18; // smooth ambient rotation
  let radius = 375;

  // Responsive radius calculation based on drum panel width
  const updateGeometry = () => {
    const w = drum.offsetWidth || 310;
    // R = (w / 2) / tan(PI / total)
    radius = Math.round((w / 2) / Math.tan(Math.PI / total));
    drum.style.setProperty('--tz', `${radius}px`);
  };
  updateGeometry();
  window.addEventListener('resize', updateGeometry, { passive: true });

  // Mouse drag handlers
  stage.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.clientX;
    lastX = startX;
    velocity = 0;
    stage.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const delta = e.clientX - lastX;
    targetAngle += delta * 0.42;
    velocity = delta * 0.42;
    lastX = e.clientX;
  }, { passive: true });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      stage.style.cursor = 'grab';
    }
  });

  // Touch drag handlers (mobile & tablet)
  stage.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    isDragging = true;
    startX = e.touches[0].clientX;
    lastX = startX;
    velocity = 0;
  }, { passive: true });

  window.addEventListener('touchmove', e => {
    if (!isDragging || e.touches.length !== 1) return;
    const x = e.touches[0].clientX;
    const delta = x - lastX;
    targetAngle += delta * 0.42;
    velocity = delta * 0.42;
    lastX = x;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Pause ambient rotation when hovering over stage
  stage.addEventListener('mouseenter', () => { isHovered = true; });
  stage.addEventListener('mouseleave', () => { isHovered = false; });

  // Navigation buttons (45 deg step)
  prevBtn && prevBtn.addEventListener('click', () => {
    targetAngle += stepAngle;
    velocity = 0;
  });
  nextBtn && nextBtn.addEventListener('click', () => {
    targetAngle -= stepAngle;
    velocity = 0;
  });

  // Smooth RAF physics loop
  function loop() {
    // Ambient auto-spin when idle
    if (!isDragging && !isHovered) {
      targetAngle -= autoRotateSpeed;
    }

    // Momentum / inertia deceleration
    if (!isDragging && Math.abs(velocity) > 0.01) {
      targetAngle += velocity;
      velocity *= 0.93; // friction
    }

    // Smooth lerp easing
    currentAngle = lerp(currentAngle, targetAngle, 0.095);
    drum.style.transform = `rotateY(${currentAngle}deg)`;

    // Volumetric 3D depth: show crisp front 3 panels and cleanly hide rear panels
    panels.forEach((p, idx) => {
      let a = (idx * stepAngle + currentAngle) % 360;
      if (a < -180) a += 360;
      if (a > 180) a -= 360;
      const absA = Math.abs(a);

      if (absA > 88) {
        p.style.opacity = '0';
        p.style.visibility = 'hidden';
        p.style.pointerEvents = 'none';
      } else {
        p.style.visibility = 'visible';
        const facing = Math.max(0, Math.cos((a * Math.PI) / 180));
        const opacity = 0.35 + facing * 0.65;
        const brightness = 0.65 + facing * 0.5;

        p.style.opacity = opacity.toFixed(3);
        p.style.filter = `brightness(${brightness.toFixed(3)})`;
        p.style.pointerEvents = absA < 60 ? 'auto' : 'none';
      }
    });

    requestAnimationFrame(loop);
  }
  loop();
})();

// ── UNIFIED TUNNEL SCROLL + 3D EYE PARALLAX RAF LOOP ─────
(function () {
  const wrapper     = document.getElementById('hero-wrapper');
  const tunnelScene = document.getElementById('tunnel-scene');
  const wallTop     = document.getElementById('wall-top');
  const wallBot     = document.getElementById('wall-bottom');
  const wallLeft    = document.getElementById('wall-left');
  const wallRight   = document.getElementById('wall-right');
  const eyesCont    = document.getElementById('eyes-container');
  const eyeLeft     = document.getElementById('cyber-eye-left');
  const eyeRight    = document.getElementById('cyber-eye-right');
  const layersL = {
    iris:  document.getElementById('iris-bg-left'),
    pupil: document.getElementById('pupil-core-left'),
    glare: document.getElementById('glare-left')
  };
  const layersR = {
    iris:  document.getElementById('iris-bg-right'),
    pupil: document.getElementById('pupil-core-right'),
    glare: document.getElementById('glare-right')
  };

  if (!wrapper) return;

  let targetProg = 0, currentProg = 0, cx = 0, cy = 0;
  let scrollableDistance = wrapper.offsetHeight - window.innerHeight;
  window.addEventListener('resize', () => { scrollableDistance = wrapper.offsetHeight - window.innerHeight; }, { passive: true });
  window.addEventListener('scroll', () => {
    const currentScroll = -wrapper.getBoundingClientRect().top;
    targetProg = Math.max(0, Math.min(1, currentScroll / scrollableDistance));
  }, { passive: true });

  const eyes = [
    { svg: eyeLeft,  L: layersL, curX: 0, curY: 0 },
    { svg: eyeRight, L: layersR, curX: 0, curY: 0 }
  ];

  // Dirty-check to skip unnecessary DOM writes
  let lastSP = -1, lastCX = -1, lastCY = -1;

  function mainLoop() {
    currentProg = lerp(currentProg, targetProg, 0.09);
    cx = lerp(cx, mouse.tx, 0.06);
    cy = lerp(cy, mouse.ty, 0.06);
    const sp = currentProg;

    const spChanged    = Math.abs(sp - lastSP) > 0.0005;
    const mouseChanged = Math.abs(cx - lastCX) > 0.001 || Math.abs(cy - lastCY) > 0.001;

    if (spChanged || mouseChanged) {
      lastSP = sp; lastCX = cx; lastCY = cy;

      const fade       = Math.max(0, 1 - Math.pow(sp / 0.75, 1.4));
      const scale      = 1 + sp * 9.5;
      const rotZ       = -sp * 90;

      if (tunnelScene) {
        tunnelScene.style.transform = `translate(${cx * 18}px,${cy * 18}px) scale(${scale}) rotate(${rotZ}deg)`;
        tunnelScene.style.opacity   = fade;
      }
      if (wallTop)   wallTop.style.transform   = `perspective(500px) rotateX(${(-38 + sp * 38) + cy * 2}deg)`;
      if (wallBot)   wallBot.style.transform   = `perspective(500px) rotateX(${( 38 - sp * 38) + cy * 2}deg)`;
      if (wallLeft)  wallLeft.style.transform  = `translateY(-50%) perspective(750px) rotateY(${(36 - sp * 26) - cx * 3}deg)`;
      if (wallRight) wallRight.style.transform = `translateY(-50%) perspective(750px) rotateY(${(-36 + sp * 26) - cx * 3}deg)`;

      if (eyesCont) {
        eyesCont.style.transform = `translate(-50%,-50%) scale(${1 + sp * 6.5})`;
        eyesCont.style.opacity   = fade;
      }
    }

    // Eye 3D parallax only when hero visible
    if (sp < 0.8 && eyeLeft && eyeRight) {
      eyes.forEach(eye => {
        if (!eye.svg || !eye.L.iris) return;
        const rect = eye.svg.getBoundingClientRect();
        const dx = mouse.x - (rect.left + rect.width  / 2);
        const dy = mouse.y - (rect.top  + rect.height / 2);
        const angle = Math.atan2(dy, dx);
        const cosA  = Math.cos(angle), sinA = Math.sin(angle);
        const mX = 70, mY = 35;
        const maxR  = (mX * mY) / Math.sqrt((mY * cosA) ** 2 + (mX * sinA) ** 2);
        const moveR = Math.min(Math.hypot(dx, dy) * 0.15, maxR);
        eye.curX = lerp(eye.curX, cosA * moveR, 0.09);
        eye.curY = lerp(eye.curY, sinA * moveR, 0.09);
        const x = eye.curX, y = eye.curY;
        eye.L.iris.setAttribute('transform',  `translate(${x * 0.9},${y * 0.9})`);
        eye.L.pupil.setAttribute('transform', `translate(${x * 1.35},${y * 1.35})`);
        eye.L.glare.setAttribute('transform', `translate(${x * 0.35},${y * 0.35})`);
      });
    }

    requestAnimationFrame(mainLoop);
  }
  mainLoop();
})();

// ── PHOTO TEXT REVEAL ─────────────────────────────────────
(function () {
  const tb = document.getElementById('photo-text-block');
  if (!tb) return;
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { tb.classList.add('visible'); io.unobserve(tb); } });
  }, { threshold: 0.3 });
  io.observe(tb);
})();

// ── 3D CARD TILT ──────────────────────────────────────────
document.querySelectorAll('.proj-card, .skill-cat').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform  = `translateY(-8px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg)`;
    card.style.transition = 'transform 0.1s';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
  });
});

// ── CONTACT FORM (Web3Forms API) ──────────────────────────
(function () {
  const form = document.getElementById('contact-form');
  const btn  = document.getElementById('btn-send');
  if (!form || !btn) return;
  const orig = btn.innerHTML;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    btn.innerHTML = '<span>Sending message...</span>';
    btn.disabled = true;
    btn.style.opacity = '0.85';

    try {
      const formData = new FormData(form);
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (res.status === 200 && data.success) {
        btn.innerHTML = '<span>Message Sent! &#10003;</span>';
        btn.style.background = 'linear-gradient(135deg, #10b981, #34d399)';
        btn.style.boxShadow  = '0 0 30px rgba(16, 185, 129, 0.45)';
        btn.style.color      = '#ffffff';
        form.reset();
        setTimeout(() => {
          btn.innerHTML = orig;
          btn.style.background = '';
          btn.style.boxShadow  = '';
          btn.style.color      = '';
          btn.style.opacity    = '';
          btn.disabled = false;
        }, 4500);
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Web3Forms Error:', err);
      btn.innerHTML = '<span>Failed to send. Try WhatsApp!</span>';
      btn.style.background = 'linear-gradient(135deg, #ef4444, #f87171)';
      btn.style.boxShadow  = '0 0 30px rgba(239, 68, 68, 0.45)';
      btn.style.color      = '#ffffff';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.style.boxShadow  = '';
        btn.style.color      = '';
        btn.style.opacity    = '';
        btn.disabled = false;
      }, 4500);
    }
  });
})();

// ── REALISTIC RANDOM EYE BLINKING ────────────────────────
(function () {
  const eyeLeft  = document.getElementById('cyber-eye-left');
  const eyeRight = document.getElementById('cyber-eye-right');
  if (!eyeLeft || !eyeRight) return;

  function triggerBlink() {
    eyeLeft.classList.add('blinking');
    eyeRight.classList.add('blinking');
    setTimeout(() => {
      eyeLeft.classList.remove('blinking');
      eyeRight.classList.remove('blinking');
      if (Math.random() < 0.25) {
        setTimeout(() => {
          eyeLeft.classList.add('blinking');
          eyeRight.classList.add('blinking');
          setTimeout(() => { eyeLeft.classList.remove('blinking'); eyeRight.classList.remove('blinking'); }, 130);
        }, 110);
      }
    }, 150);
    setTimeout(triggerBlink, Math.random() * 3800 + 2200);
  }
  setTimeout(triggerBlink, 1800);
})();

console.log('%c FAJAR NUR FARRIJAL ', 'font-family:monospace;background:linear-gradient(135deg,#39ff6e,#b8ff00);color:#000;font-weight:bold;font-size:16px;padding:6px 16px;border-radius:4px;');
