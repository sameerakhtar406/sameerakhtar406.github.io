/**
 * Sameer Akhtar - Portfolio JavaScript
 * Implementation of:
 * - Dynamic Canvas Particles (Interactive background)
 * - Typewriter Text Effect
 * - Floating Header Scroll Logic & Mobile Menu Toggler
 * - Active Section Scroll Spy
 * - GitHub API Integration & Repository Filtering
 * - Form Validation & Client-side Email Generation
 */

document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    initTypewriter();
    initNavbar();
    initScrollSpy();
    fetchGitHubRepos();
    initContactForm();
});

/* ==========================================================================
   1. Interactive Particles Canvas
   ========================================================================== */
function initCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let animationId;

    // Mouse interactive coordinates
    const mouse = {
        x: null,
        y: null,
        radius: 120 // Radius of interaction
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object Definition
    class Particle {
        constructor(x, y, directionX, directionY, size, color) {
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
            this.color = color;
        }

        // Draw particle node
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // Update particle positions and check boundary/mouse collisions
        update() {
            // Check canvas boundaries
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interaction: pull particles slightly toward pointer
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    this.x -= dx * force * 0.03;
                    this.y -= dy * force * 0.03;
                }
            }

            // Move particle
            this.x += this.directionX;
            this.y += this.directionY;
            
            this.draw();
        }
    }

    // Initialize particle array based on viewport size
    function init() {
        particlesArray = [];
        let numberOfParticles = Math.floor((canvas.width * canvas.height) / 16000);
        
        // Cap particles for performance
        if (numberOfParticles > 90) numberOfParticles = 90;
        if (numberOfParticles < 20) numberOfParticles = 20;

        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.8;
            let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.4) - 0.2;
            let directionY = (Math.random() * 0.4) - 0.2;
            // Theme colors: Cyan/Purple glow mixes
            let color = Math.random() > 0.5 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(168, 85, 247, 0.3)';
            
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Connect particles that are close to each other
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let dx = particlesArray[a].x - particlesArray[b].x;
                let dy = particlesArray[a].y - particlesArray[b].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 110) {
                    opacityValue = 1 - (distance / 110);
                    ctx.strokeStyle = `rgba(6, 182, 212, ${opacityValue * 0.15})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Resize Event
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
}

/* ==========================================================================
   2. Typewriter Effect
   ========================================================================== */
function initTypewriter() {
    const textElement = document.getElementById('typing-text');
    if (!textElement) return;

    const roles = [
        "Software Engineer",
        "Algorithmic Problem Solver",
        "Product Strategist",
        "Community Leader"
    ];
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    function type() {
        const currentRole = roles[roleIndex];
        
        if (isDeleting) {
            textElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50; // Deletes faster
        } else {
            textElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 120; // Natural typing speed
        }

        if (!isDeleting && charIndex === currentRole.length) {
            typeSpeed = 2000; // Pause at full word
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            typeSpeed = 500; // Brief pause before typing next
        }

        setTimeout(type, typeSpeed);
    }

    setTimeout(type, 1000);
}

/* ==========================================================================
   3. Navbar Scroll Behavior & Mobile Toggle
   ========================================================================== */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            const icon = mobileToggle.querySelector('i');
            if (navMenu.classList.contains('active')) {
                icon.className = 'fa-solid fa-xmark';
            } else {
                icon.className = 'fa-solid fa-bars';
            }
        });
    }

    // Close mobile menu on nav click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                if (mobileToggle) {
                    mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
                }
            }
        });
    });
}

/* ==========================================================================
   4. Scroll Spy Navigation Highlighter
   ========================================================================== */
function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + 120; // Offset for fixed navbar

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < (sectionTop + sectionHeight)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ==========================================================================
   5. GitHub Public Repos Fetching and Filtering
   ========================================================================== */
async function fetchGitHubRepos() {
    const reposGrid = document.getElementById('github-repos-grid');
    const loadingEl = document.getElementById('github-loading');
    if (!reposGrid) return;

    try {
        const response = await fetch('https://api.github.com/users/sameerakhtar406/repos?sort=updated&per_page=30');
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }
        
        const repos = await response.json();
        
        // Filter out typical classroom assignments
        const filteredRepos = repos.filter(repo => {
            const name = repo.name.toLowerCase();
            const isFork = repo.fork;
            
            // Homework prefixes: c22, project-35, c-34, etc.
            const isHwPrefix = /^(-?c\d+|c-\d+|-?project-\d+|-?class-\d+|er-p-|er--p|crumpled-balls)/.test(name);
            
            // Also ignore generic short assignment names like "c23", "c34"
            const isShortHw = (name.length <= 5 && name.startsWith('c') && !isNaN(name.substring(1)));
            
            return !isHwPrefix && !isShortHw && !isFork;
        });

        // Hide loading indicator
        if (loadingEl) loadingEl.style.display = 'none';

        if (filteredRepos.length === 0) {
            reposGrid.innerHTML = `
                <div class="repo-error" style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">
                    <p>No featured public repositories found. View my full work directly on GitHub!</p>
                </div>
            `;
            return;
        }

        // Render repositories
        reposGrid.innerHTML = filteredRepos.map(repo => {
            const language = repo.language || 'Code';
            const langClass = language.toLowerCase();
            const desc = repo.description || 'A software project developed in computer science fields.';
            
            return `
                <div class="repo-card glass-card">
                    <div>
                        <h4 class="repo-name">
                            <i class="fa-solid fa-folder-open"></i>
                            ${repo.name}
                        </h4>
                        <p class="repo-desc">${desc}</p>
                    </div>
                    <div class="repo-footer">
                        <span class="repo-lang">
                            <span class="lang-dot ${langClass}"></span>
                            ${language}
                        </span>
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="repo-link">
                            Code <i class="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading repos:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        
        // Show fallback UI for rate limits or offline state
        reposGrid.innerHTML = `
            <div class="repo-card glass-card" style="grid-column: 1/-1; text-align: center; padding: 40px;">
                <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.2rem; color: var(--color-purple); margin-bottom: 12px;"></i>
                <h4>Could not load GitHub projects</h4>
                <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 8px 0 16px;">
                    We hit the rate limit or you're offline. You can view all my public source codes directly on GitHub.
                </p>
                <a href="https://github.com/sameerakhtar406" target="_blank" rel="noopener noreferrer" class="btn btn-secondary" style="padding: 8px 20px; font-size: 0.9rem;">
                    Go to GitHub <i class="fa-brands fa-github icon-right"></i>
                </a>
            </div>
        `;
    }
}

/* ==========================================================================
   6. Contact Form Submission Logic (Native pre-filled mail draft client-side)
   ========================================================================== */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('form-name').value.trim();
        const email = document.getElementById('form-email').value.trim();
        const subject = document.getElementById('form-subject').value.trim();
        const message = document.getElementById('form-message').value.trim();

        if (!name || !email || !subject || !message) {
            showStatus('Please fill in all fields.', 'error');
            return;
        }

        // Pre-fill fields for a native mailto email draft
        const recipient = 'sameerakhtar406@gmail.com';
        const mailtoSubject = encodeURIComponent(`[Portfolio Contact] ${subject}`);
        const mailtoBody = encodeURIComponent(`Hello Sameer,\n\n${message}\n\nBest regards,\n${name}\nEmail: ${email}`);
        
        // Redirect to trigger user's native mail app
        window.location.href = `mailto:${recipient}?subject=${mailtoSubject}&body=${mailtoBody}`;

        showStatus('Opening your default email client to send the message...', 'success');
        form.reset();
        
        // Clear status after 5 seconds
        setTimeout(() => {
            formStatus.textContent = '';
            formStatus.className = 'form-status';
        }, 6000);
    });

    function showStatus(msg, type) {
        formStatus.textContent = msg;
        formStatus.className = `form-status ${type}`;
    }
}
