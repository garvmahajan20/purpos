
(function () {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const SYMBOLS = ["✦", "◦", "·", "✦", "◦", "·", "◦"];
    const COLOR_LIGHT = "rgba(81,118,100,";
    const COLOR_DARK  = "rgba(231,222,205,";

    let W, H, particles;

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function makeParticle() {
        return {
            x: Math.random() * W,
            y: Math.random() * H,
            size: 8 + Math.random() * 14,
            symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
            speedX: (Math.random() - 0.5) * 0.35,
            speedY: -(0.18 + Math.random() * 0.28),
            alpha: 0.08 + Math.random() * 0.22,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.008,
            life: Math.random(),
        };
    }

    function init() {
        resize();
        particles = Array.from({ length: 55 }, makeParticle);
    }

    function isDark() {
        return document.body.classList.contains("darkmode");
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);
        const colorBase = isDark() ? COLOR_DARK : COLOR_LIGHT;

        particles.forEach(p => {
            p.x += p.speedX;
            p.y += p.speedY;
            p.rotation += p.rotSpeed;
            p.life += 0.003;

            if (p.y < -30 || p.x < -30 || p.x > W + 30) {
                Object.assign(p, makeParticle(), { y: H + 20, x: Math.random() * W });
            }

            const pulse = 0.5 + 0.5 * Math.sin(p.life * Math.PI * 2);
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation);
            ctx.globalAlpha = p.alpha * (0.6 + 0.4 * pulse);
            ctx.font = `${p.size}px serif`;
            ctx.fillStyle = colorBase + "1)";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(p.symbol, 0, 0);
            ctx.restore();
        });

        requestAnimationFrame(draw);
    }

    window.addEventListener("resize", resize);
    init();
    draw();
})();

(function () {
    const hero = document.querySelector(".hero-image");
    if (!hero) return;
    window.addEventListener("scroll", () => {
        const y = window.scrollY;
        hero.style.transform = `scale(1) translateY(${y * 0.28}px)`;
    }, { passive: true });
})();

(function () {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    window.addEventListener("scroll", () => {
        if (window.scrollY > 60) {
            nav.style.height = "58px";
            nav.style.boxShadow = "0 4px 32px rgba(0,0,0,0.22)";
        } else {
            nav.style.height = "76px";
            nav.style.boxShadow = "0 2px 24px rgba(0,0,0,0.18)";
        }
    }, { passive: true });
})();

(function () {
    const el = document.querySelector(".ngoname");
    if (!el) return;
    const text = el.textContent.trim();
    el.innerHTML = text.split("").map((ch, i) =>
        `<span class="nl" style="--li:${i};display:inline-block">${ch}</span>`
    ).join("");

    const style = document.createElement("style");
    style.textContent = `
        .nl {
            opacity: 0;
            transform: translateY(-18px);
            animation: nlDrop 0.5s cubic-bezier(0.16,1,0.3,1) forwards;
            animation-delay: calc(0.55s + var(--li) * 0.07s);
        }
        @keyframes nlDrop { to { opacity:1; transform:translateY(0); } }
    `;
    document.head.appendChild(style);
})();

(function () {
    const glow = document.createElement("div");
    glow.style.cssText = `
        position:fixed; pointer-events:none; z-index:9999;
        width:300px; height:300px; border-radius:50%;
        background: radial-gradient(circle, rgba(81,118,100,0.07) 0%, transparent 70%);
        transform: translate(-50%,-50%);
        transition: opacity 0.4s;
        top:0; left:0;
    `;
    document.body.appendChild(glow);

    let tx = -300, ty = -300;
    window.addEventListener("mousemove", e => {
        tx = e.clientX; ty = e.clientY;
    });
    window.addEventListener("mouseleave", () => { glow.style.opacity = "0"; });
    window.addEventListener("mouseenter", () => { glow.style.opacity = "1"; });

    (function loop() {
        glow.style.left = tx + "px";
        glow.style.top  = ty + "px";
        requestAnimationFrame(loop);
    })();
})();
