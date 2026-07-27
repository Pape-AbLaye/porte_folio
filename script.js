// Portfolio — Papa Abdoulaye Ndiaye (L@yeTech)
// Code original, écrit pour ce portfolio.

document.getElementById('year').textContent = new Date().getFullYear();

/* ---------- Navigation scroll state ---------- */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
});

/* ---------- Mobile menu ---------- */
const menuToggle = document.getElementById('mobileMenuToggle');
const mobileNav = document.getElementById('mobileNav');
const mobileOverlay = document.getElementById('mobileOverlay');

function closeMobileMenu() {
    menuToggle.classList.remove('active');
    mobileNav.classList.remove('active');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

menuToggle.addEventListener('click', () => {
    const opening = !mobileNav.classList.contains('active');
    menuToggle.classList.toggle('active', opening);
    mobileNav.classList.toggle('active', opening);
    mobileOverlay.classList.toggle('active', opening);
    document.body.style.overflow = opening ? 'hidden' : '';
});
mobileOverlay.addEventListener('click', closeMobileMenu);
document.querySelectorAll('.mobile-nav a').forEach(link => link.addEventListener('click', closeMobileMenu));

/* ---------- Smooth in-page scrolling (accounts for fixed nav height) ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const targetId = anchor.getAttribute('href');
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        closeMobileMenu();
        const offset = target.offsetTop - nav.offsetHeight;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    });
});

/* ---------- Active nav link on scroll ---------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav a');

function updateActiveLink() {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - nav.offsetHeight - 120;
        if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}
window.addEventListener('scroll', updateActiveLink);
updateActiveLink();

/* ---------- Scroll reveal ---------- */
const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ---------- Language bars fill on view ---------- */
const langObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            document.querySelectorAll('.lang-bar-fill').forEach(bar => {
                bar.style.width = `${bar.dataset.width}%`;
            });
            langObserver.disconnect();
        }
    });
}, { threshold: 0.4 });
const languagesRow = document.querySelector('.languages-row');
if (languagesRow) langObserver.observe(languagesRow);

/* ---------- Hero signature: animated node network ---------- */
(function initNodeNetwork() {
    const canvas = document.getElementById('nodeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const labels = ['L@yeTech', 'Data', 'IA', 'Backend', 'Mobile', 'Sécurité'];
    let nodes = [];
    let width, height, dpr;

    function resize() {
        dpr = window.devicePixelRatio || 1;
        width = canvas.clientWidth;
        height = canvas.clientHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        layoutNodes();
    }

    function layoutNodes() {
        const cx = width / 2;
        const cy = height / 2;
        const radius = Math.min(width, height) * 0.34;
        nodes = labels.map((label, i) => {
            if (i === 0) {
                return { label, x: cx, y: cy, isCore: true, angle: 0, radius: 0, phase: 0 };
            }
            const angle = ((i - 1) / (labels.length - 1)) * Math.PI * 2 - Math.PI / 2;
            return {
                label,
                angle,
                radius,
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius,
                isCore: false,
                phase: Math.random() * Math.PI * 2
            };
        });
    }

    function draw(t) {
        ctx.clearRect(0, 0, width, height);
        const core = nodes[0];
        const drift = reduceMotion ? 0 : Math.sin(t / 1800) * 6;

        // update satellite positions with gentle orbit-breathing
        nodes.forEach((n, i) => {
            if (n.isCore) return;
            const bob = reduceMotion ? 0 : Math.sin(t / 2200 + n.phase) * 8;
            const r = n.radius + bob;
            n.x = core.x + Math.cos(n.angle) * r;
            n.y = core.y + Math.sin(n.angle) * r + drift * 0.2;
        });

        // connections
        nodes.forEach((n, i) => {
            if (n.isCore) return;
            const grad = ctx.createLinearGradient(core.x, core.y, n.x, n.y);
            grad.addColorStop(0, 'rgba(232, 163, 61, 0.55)');
            grad.addColorStop(1, 'rgba(61, 220, 151, 0.15)');
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(core.x, core.y);
            ctx.lineTo(n.x, n.y);
            ctx.stroke();

            // traveling pulse along the line
            if (!reduceMotion) {
                const pulseT = ((t / 1500) + i * 0.18) % 1;
                const px = core.x + (n.x - core.x) * pulseT;
                const py = core.y + (n.y - core.y) * pulseT;
                ctx.beginPath();
                ctx.arc(px, py, 2.4, 0, Math.PI * 2);
                ctx.fillStyle = '#f0c674';
                ctx.fill();
            }
        });

        // satellite nodes
        nodes.forEach(n => {
            const r = n.isCore ? 7 : 5;
            ctx.beginPath();
            ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
            ctx.fillStyle = n.isCore ? '#e8a33d' : '#3ddc97';
            ctx.shadowColor = n.isCore ? 'rgba(232,163,61,0.6)' : 'rgba(61,220,151,0.5)';
            ctx.shadowBlur = n.isCore ? 18 : 10;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.font = n.isCore ? '600 14px "Space Grotesk", sans-serif' : '500 12px "JetBrains Mono", monospace';
            ctx.fillStyle = n.isCore ? '#edeef2' : '#8b93a7';
            ctx.textAlign = 'center';
            ctx.fillText(n.label, n.x, n.y + (n.isCore ? -18 : -14));
        });

        if (!reduceMotion) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener('resize', resize);
    requestAnimationFrame(draw);
    if (reduceMotion) draw(0);
})();