/*
   MANSA ENGINE - APP.JS
   Includes: Canvas Particles, SPA Router, Interactive Games, Mock Database, Dashboard Analytics
*/

document.addEventListener('DOMContentLoaded', () => {
    // --- SOUND EFFECTS FALLBACKS ---
    const sounds = {
        click: document.getElementById('snd-click'),
        success: document.getElementById('snd-success'),
        fail: document.getElementById('snd-fail'),
        gameover: document.getElementById('snd-gameover')
    };
    
    let isSoundOn = true;
    function playSound(type) {
        if (!isSoundOn) return;
        
        // Simple synthetic sound fallbacks in case audio elements fail to load or autoplay blocks them
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            if (type === 'click') {
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
                osc.start();
                osc.stop(ctx.currentTime + 0.08);
            } else if (type === 'success') {
                osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
                osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
                osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
                osc.start();
                osc.stop(ctx.currentTime + 0.35);
            } else if (type === 'fail') {
                osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
                osc.frequency.setValueAtTime(147, ctx.currentTime + 0.1); // D3
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
                osc.start();
                osc.stop(ctx.currentTime + 0.25);
            } else if (type === 'gameover') {
                osc.frequency.setValueAtTime(196, ctx.currentTime); // G3
                osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
                osc.frequency.setValueAtTime(130.81, ctx.currentTime + 0.3); // C3
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
                osc.start();
                osc.stop(ctx.currentTime + 0.6);
            }
        } catch (e) {
            console.log("Audio synthesis not allowed/supported until interaction.", e);
        }
    }

    // Toggle sound
    const audioToggle = document.getElementById('audio-toggle');
    const soundOnIcon = audioToggle.querySelector('.sound-on');
    const soundOffIcon = audioToggle.querySelector('.sound-off');
    
    audioToggle.addEventListener('click', () => {
        isSoundOn = !isSoundOn;
        if (isSoundOn) {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add('hidden');
            playSound('click');
        } else {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
        }
    });

    // --- CANVAS PARTICLE BACKGROUND ---
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    
    let particles = [];
    const particleCount = 45;
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * 0.4 - 0.2;
            this.color = Math.random() > 0.5 ? 'rgba(0, 240, 255, 0.2)' : 'rgba(189, 0, 255, 0.15)';
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
    
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid tracking pointers or links between particles
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.03)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    // --- MOCK DATABASE (localStorage based) ---
    const DB_KEYS = {
        USERS: 'mansa_users',
        SCORES: 'mansa_scores',
        CONFIG: 'mansa_config',
        CURRENT_USER: 'mansa_active_user'
    };

    // Default configuration parameters
    const DEFAULT_CONFIG = {
        flashDuration: 800,
        gridSize: 4,
        difficultyScale: 1.35
    };

    // Initialize LocalStorage Database if empty
    function initDatabase() {
        if (!localStorage.getItem(DB_KEYS.USERS)) {
            const initialUsers = [
                { id: 'usr-1', email: 'user@mansa.gg', password: 'password', username: 'AlphaRecall', role: 'user', level: 5, xp: 650 },
                { id: 'usr-2', email: 'gamer@mansa.gg', password: 'password', username: 'NeuronTrigger', role: 'user', level: 3, xp: 200 },
                { id: 'adm-1', email: 'admin@mansa.gg', password: 'adminpass', username: 'Mansa_Overlord', role: 'admin', level: 99, xp: 0 }
            ];
            localStorage.setItem(DB_KEYS.USERS, JSON.stringify(initialUsers));
        }

        if (!localStorage.getItem(DB_KEYS.SCORES)) {
            const initialScores = [
                { username: 'AlphaRecall', gameMode: 'Grid Flash', score: 24500, level: 8, date: '2026-06-05' },
                { username: 'NeuronTrigger', gameMode: 'Grid Flash', score: 14200, level: 5, date: '2026-06-07' },
                { username: 'AlphaRecall', gameMode: 'Number Sequence', score: 18400, level: 7, date: '2026-06-07' },
                { username: 'BetaRecall', gameMode: 'Grid Flash', score: 9800, level: 3, date: '2026-06-08' }
            ];
            localStorage.setItem(DB_KEYS.SCORES, JSON.stringify(initialScores));
        }

        if (!localStorage.getItem(DB_KEYS.CONFIG)) {
            localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(DEFAULT_CONFIG));
        }
    }
    initDatabase();

    // Utility DB Accessors
    const DB = {
        getUsers: () => JSON.parse(localStorage.getItem(DB_KEYS.USERS)),
        saveUsers: (users) => localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users)),
        getScores: () => JSON.parse(localStorage.getItem(DB_KEYS.SCORES)),
        addScore: (scoreObj) => {
            const scores = DB.getScores();
            scores.unshift(scoreObj);
            localStorage.setItem(DB_KEYS.SCORES, JSON.stringify(scores));
        },
        getConfig: () => JSON.parse(localStorage.getItem(DB_KEYS.CONFIG)),
        saveConfig: (cfg) => localStorage.setItem(DB_KEYS.CONFIG, JSON.stringify(cfg)),
        getCurrentUser: () => JSON.parse(localStorage.getItem(DB_KEYS.CURRENT_USER)),
        setCurrentUser: (usr) => localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(usr)),
        clearCurrentUser: () => localStorage.removeItem(DB_KEYS.CURRENT_USER)
    };

    // --- SPA NAVIGATION ROUTING ---
    const navLinks = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.tab-content');
    
    function navigateToSection(targetId) {
        // Abort active game run if navigating away from Train section
        if (targetId !== 'train' && gameActive) {
            abortGame();
        }

        playSound('click');
        
        // Hide mobile menu if open
        document.getElementById('nav-links').classList.remove('mobile-active');
        
        // Remove active class from links
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === targetId) {
                link.classList.add('active');
            }
        });

        // If trying to access user-dashboard or admin-dashboard sections manually
        let actualSectionId = targetId + '-section';
        if (targetId === 'user-dashboard' || targetId === 'admin-dashboard') {
            actualSectionId = targetId + '-section';
        }

        // Show/hide sections with a fade-in animation
        sections.forEach(sec => {
            if (sec.id === actualSectionId) {
                sec.classList.add('active-section');
            } else {
                sec.classList.remove('active-section');
            }
        });
    }

    // Bind navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            
            // Check routing rules
            const activeUser = DB.getCurrentUser();
            if (tabId === 'login' && activeUser) {
                // Already logged in, direct to their dashboard instead
                navigateToSection(activeUser.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
            } else {
                navigateToSection(tabId);
            }
        });
    });

    // Logo Click returns Home
    document.getElementById('nav-logo').addEventListener('click', (e) => {
        e.preventDefault();
        navigateToSection('home');
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navLinksContainer = document.getElementById('nav-links');
    mobileToggle.addEventListener('click', () => {
        navLinksContainer.classList.toggle('mobile-active');
    });

    // Hero buttons routing shortcuts
    document.getElementById('hero-train-btn').addEventListener('click', () => navigateToSection('train'));
    document.getElementById('hero-login-btn').addEventListener('click', () => navigateToSection('login'));
    document.getElementById('user-start-train-btn').addEventListener('click', () => navigateToSection('train'));

    // --- COUNTER ANIMATION FOR HOMEPAGE STATS ---
    function animateCounters() {
        const stats = document.querySelectorAll('.stat-value');
        stats.forEach(stat => {
            const targetVal = parseFloat(stat.getAttribute('data-val'));
            const isFloat = stat.getAttribute('data-val').includes('.');
            let currentVal = 0;
            const duration = 1500;
            const stepTime = 30;
            const totalSteps = duration / stepTime;
            const increment = targetVal / totalSteps;
            
            const interval = setInterval(() => {
                currentVal += increment;
                if (currentVal >= targetVal) {
                    currentVal = targetVal;
                    clearInterval(interval);
                }
                
                if (isFloat) {
                    stat.textContent = currentVal.toFixed(1);
                } else {
                    stat.textContent = Math.floor(currentVal).toLocaleString();
                }
            }, stepTime);
        });
    }
    // Fire counter animation on home page load
    setTimeout(animateCounters, 500);

    // --- ATHLETE & ADMIN AUTH SYSTEM ---
    const authForm = document.getElementById('auth-form');
    const signupToggle = document.getElementById('signup-toggle');
    const signupToggleHelper = document.getElementById('signup-toggle-helper');
    const tabBtnUser = document.getElementById('tab-btn-user');
    const tabBtnAdmin = document.getElementById('tab-btn-admin');
    const formRoleTitle = document.getElementById('form-role-title');
    const formRoleSubtitle = document.getElementById('form-role-subtitle');
    const authSubmitBtnText = document.querySelector('#auth-submit-btn .btn-text');

    let currentRole = 'user'; // 'user' or 'admin'
    let isSignupMode = false;

    // Toggle Role tabs
    tabBtnUser.addEventListener('click', () => {
        currentRole = 'user';
        tabBtnUser.classList.add('active');
        tabBtnAdmin.classList.remove('active');
        formRoleTitle.textContent = isSignupMode ? "ENLIST NEW ATHLETE" : "ATHLETE SIGN IN";
        formRoleSubtitle.textContent = isSignupMode ? "Register a new cognitive profile" : "Provide your credentials to sync training progress";
        signupToggleHelper.classList.remove('hidden');
        playSound('click');
    });

    tabBtnAdmin.addEventListener('click', () => {
        currentRole = 'admin';
        tabBtnAdmin.classList.add('active');
        tabBtnUser.classList.remove('active');
        isSignupMode = false; // Admin cannot sign up
        formRoleTitle.textContent = "ADMIN TERMINAL ACCESS";
        formRoleSubtitle.textContent = "Elevated credentials validation required";
        signupToggleHelper.classList.add('hidden');
        authSubmitBtnText.textContent = "ACCESS TERMINAL";
        playSound('click');
    });

    // Toggle Sign Up Mode (Only for users)
    signupToggle.addEventListener('click', (e) => {
        e.preventDefault();
        isSignupMode = !isSignupMode;
        if (isSignupMode) {
            formRoleTitle.textContent = "ENLIST NEW ATHLETE";
            formRoleSubtitle.textContent = "Register a new cognitive profile";
            authSubmitBtnText.textContent = "CREATING ACCOUNT...";
            signupToggle.textContent = "Access Portal Logins";
        } else {
            formRoleTitle.textContent = "ATHLETE SIGN IN";
            formRoleSubtitle.textContent = "Provide your credentials to sync training progress";
            authSubmitBtnText.textContent = "ACCESS CORE";
            signupToggle.textContent = "Enlist in the Program";
        }
        authSubmitBtnText.textContent = isSignupMode ? "REGISTER ATHLETE" : "ACCESS CORE";
        playSound('click');
    });

    // Demo Accounts click triggers
    document.getElementById('demo-user-btn').addEventListener('click', (e) => {
        e.preventDefault();
        tabBtnUser.click();
        document.getElementById('auth-email').value = 'user@mansa.gg';
        document.getElementById('auth-password').value = 'password';
        playSound('click');
    });

    document.getElementById('demo-admin-btn').addEventListener('click', (e) => {
        e.preventDefault();
        tabBtnAdmin.click();
        document.getElementById('auth-email').value = 'admin@mansa.gg';
        document.getElementById('auth-password').value = 'adminpass';
        playSound('click');
    });

    // Form submission processing
    authForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playSound('click');
        
        const email = document.getElementById('auth-email').value.trim();
        const password = document.getElementById('auth-password').value;
        const users = DB.getUsers();

        if (isSignupMode) {
            // Check if user exists
            if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
                alert("This email is already registered in the MANSA system.");
                return;
            }
            // Generate mock profile
            const username = email.split('@')[0] || "Athlete_" + Math.floor(Math.random()*900 + 100);
            const newUsr = {
                id: 'usr-' + (users.length + 1),
                email: email,
                password: password,
                username: username,
                role: 'user',
                level: 1,
                xp: 0
            };
            users.push(newUsr);
            DB.saveUsers(users);
            
            // Auto log in
            DB.setCurrentUser(newUsr);
            updateUserWidgets();
            navigateToSection('user-dashboard');
            alert(`Welcome athlete ${username}! Profile generated successfully.`);
            
            // Clean fields
            authForm.reset();
            isSignupMode = false;
        } else {
            // Login mode
            const match = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
            if (match) {
                if (match.role !== currentRole) {
                    alert(`Invalid role credentials matching for portal category: ${currentRole.toUpperCase()}`);
                    return;
                }
                
                DB.setCurrentUser(match);
                updateUserWidgets();
                
                if (match.role === 'admin') {
                    renderAdminDashboard();
                    navigateToSection('admin-dashboard');
                } else {
                    renderUserDashboard();
                    navigateToSection('user-dashboard');
                }
                
                authForm.reset();
            } else {
                alert("ACCESS DENIED. Decrypt keycode or email doesn't match.");
            }
        }
    });

    // Logging out
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        DB.clearCurrentUser();
        updateUserWidgets();
        navigateToSection('home');
    });

    function updateUserWidgets() {
        const activeUser = DB.getCurrentUser();
        const widget = document.getElementById('user-status-widget');
        const displayName = document.getElementById('user-display-name');
        const loginNavLink = document.getElementById('login-nav-link');
        
        if (activeUser) {
            displayName.textContent = activeUser.username;
            widget.classList.remove('hidden');
            loginNavLink.textContent = activeUser.role === 'admin' ? 'Terminal' : 'Dashboard';
            loginNavLink.setAttribute('data-tab', activeUser.role === 'admin' ? 'admin-dashboard' : 'user-dashboard');
        } else {
            widget.classList.add('hidden');
            loginNavLink.textContent = 'Login';
            loginNavLink.setAttribute('data-tab', 'login');
        }
    }
    updateUserWidgets();

    // --- COGNITIVE CORE TRAINING GAMES SYSTEM ---
    const board = document.getElementById('game-board');
    const startBtn = document.getElementById('start-game-btn');
    const restartBtn = document.getElementById('restart-game-btn');
    const overlay = document.getElementById('game-overlay');
    const overlayStart = document.getElementById('overlay-start-content');
    const overlayCalibration = document.getElementById('overlay-calibration-content');
    const overlayMemorize = document.getElementById('overlay-memorize-content');
    const overlayGameOver = document.getElementById('overlay-gameover-content');
    
    const modeGridBtn = document.getElementById('mode-grid');
    const modeSequenceBtn = document.getElementById('mode-sequence');
    const modeCardsBtn = document.getElementById('mode-cards');
    const modeRepeatBtn = document.getElementById('mode-repeat');
    const modeSpeedBtn = document.getElementById('mode-speed');

    let gameActive = false;
    let gameMode = 'Grid Flash'; // 'Grid Flash', 'Number Sequence', 'Card Match', 'Sequence Repeat', 'Speed Numbers'
    let level = 1;
    let score = 0;
    let lives = 3;
    let currentSequence = []; // Grid index sequences/positions
    let userRecallSequence = [];
    let numberRecallIndex = 1; // Current ascending number user needs to click
    let isAcceptingInputs = false;

    let cardPairsMap = []; // Card match maps: index -> emoji
    let selectedCards = []; // Selected cards indices [ {tile, idx}, ... ]
    let matchedPairsCount = 0;
    let currentSpeedNumberString = '';

    // Timer and state tracking for game abort/quit safety
    let memoInterval = null;
    let countdownInterval = null;
    let simonTimeout = null;
    let flashTimeout = null;

    const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    // --- HARD TRAINING / DISCIPLINE SYSTEM ---
    const DISCIPLINE_MODES = ['Numbers', 'Names & Faces', 'Words', 'Dates', 'Cards', 'Cards Recall', 'Images', 'Binary'];
    const MARATHON_TASKS = [
        { type: 'discipline', mode: 'Numbers' },
        { type: 'discipline', mode: 'Binary' },
        { type: 'arcade', mode: 'Grid Flash' },
        { type: 'discipline', mode: 'Words' },
        { type: 'arcade', mode: 'Number Sequence' },
        { type: 'discipline', mode: 'Dates' },
        { type: 'discipline', mode: 'Names & Faces' },
        { type: 'arcade', mode: 'Speed Numbers' },
        { type: 'discipline', mode: 'Cards' },
        { type: 'arcade', mode: 'Sequence Repeat' },
        { type: 'discipline', mode: 'Images' },
        { type: 'arcade', mode: 'Card Match' }
    ];
    const WORD_POOL = ['orbit', 'neuron', 'cipher', 'matrix', 'quantum', 'synapse', 'vector', 'nexus', 'prism', 'flux', 'pulse', 'vertex', 'axiom', 'helix', 'zenith', 'cortex', 'delta', 'sigma', 'photon', 'plasma'];
    const DATE_EVENTS = ['Moon Landing', 'Berlin Wall', 'Internet Born', 'DNA Discovered', 'Steam Engine', 'First Flight', 'Printing Press', 'Telephone', 'Penicillin', 'Relativity', 'Olympics 1896', 'Great Fire', 'Magna Carta', 'Apollo 11', 'Titanic Sinks'];
    const FACE_NAMES = ['Alex', 'Jordan', 'Sam', 'Riley', 'Casey', 'Morgan', 'Taylor', 'Quinn', 'Avery', 'Blake', 'Drew', 'Jamie', 'Kai', 'Logan', 'Noah', 'Parker'];
    const FACE_EMOJIS = ['👨', '👩', '🧑', '👴', '👵', '🧔', '👱', '👳', '🧕', '👲', '🤵', '👰', '🤴', '👸', '🦸', '🦹'];
    const IMAGE_SYMBOLS = ['🔺', '🔻', '⭐', '💠', '🔶', '🔷', '⬛', '⬜', '🟥', '🟦', '🟩', '🟨', '🟪', '🟧', '⚫', '⚪'];
    const CARD_SUITS = ['♠', '♥', '♦', '♣'];
    const CARD_RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    let trainingConfig = {
        format: 'customisable',
        discipline: 'Numbers',
        difficulty: 'hard',
        skin: 'analogue',
        amount: 100,
        grouping: '3',
        memoSeconds: 120,
        recallSeconds: 300
    };
    let disciplineContent = '';
    let disciplineRecallAnswer = '';
    let marathonTaskIndex = 0;
    let recallTimerInterval = null;

    const trainingFormatEl = document.getElementById('training-format');
    const trainingDisciplineEl = document.getElementById('training-discipline');
    const trainingDifficultyEl = document.getElementById('training-difficulty');
    const customSettingsPanel = document.getElementById('custom-settings-panel');
    const disciplineRow = document.getElementById('discipline-row');
    const skinRow = document.getElementById('skin-row');
    const arcadeSelectorBar = document.getElementById('arcade-selector-bar');
    const gameBoardWrapper = document.getElementById('game-board-wrapper');
    const overlayRecall = document.getElementById('overlay-recall-content');

    const GAME_THEMES = {
        'Grid Flash':       { slug: 'grid',       icon: '🌐', accent: '#00f0ff', accent2: '#0066ff' },
        'Number Sequence':  { slug: 'sequence',   icon: '🔢', accent: '#bd00ff', accent2: '#7b2fff' },
        'Card Match':       { slug: 'cards',      icon: '🃏', accent: '#39ff14', accent2: '#00cc66' },
        'Sequence Repeat':  { slug: 'repeat',     icon: '🔁', accent: '#ffb800', accent2: '#ff8800' },
        'Speed Numbers':    { slug: 'speed',      icon: '⚡', accent: '#ff0055', accent2: '#ff4488' },
        'Numbers':          { slug: 'numbers',    icon: '🔢', accent: '#ff6b35', accent2: '#ff9500' },
        'Names & Faces':    { slug: 'faces',      icon: '👤', accent: '#ff66cc', accent2: '#cc44aa' },
        'Words':            { slug: 'words',      icon: '📝', accent: '#44ddbb', accent2: '#00aa88' },
        'Dates':            { slug: 'dates',      icon: '📅', accent: '#ffd700', accent2: '#cc9900' },
        'Cards':            { slug: 'playing',    icon: '🂡', accent: '#e63946', accent2: '#a00000' },
        'Cards Recall':     { slug: 'recall',     icon: '🎴', accent: '#6b5bff', accent2: '#4433cc' },
        'Images':           { slug: 'images',     icon: '🖼️', accent: '#aa66ff', accent2: '#7744cc' },
        'Binary':           { slug: 'binary',     icon: '💾', accent: '#aaff00', accent2: '#66cc00' },
        'Marathon':         { slug: 'marathon',   icon: '🏁', accent: '#00f0ff', accent2: '#bd00ff' }
    };

    const PLAYING_TONE_CLASSES = Object.values(GAME_THEMES).map(t => `playing-${t.slug}`);

    function getModeSlug(mode) {
        return (GAME_THEMES[mode] || GAME_THEMES['Grid Flash']).slug;
    }

    function setPlayingTone(mode) {
        const slug = getModeSlug(mode);
        gameBoardWrapper.classList.remove(...PLAYING_TONE_CLASSES);
        gameBoardWrapper.classList.add(`playing-${slug}`);
        applyGameTheme(mode);
    }

    function clearPlayingTone() {
        gameBoardWrapper.classList.remove(...PLAYING_TONE_CLASSES);
    }

    function applyGameTheme(mode) {
        const theme = GAME_THEMES[mode] || GAME_THEMES['Grid Flash'];
        const targets = [gameBoardWrapper, overlay, overlayStart];
        targets.forEach(el => {
            if (!el) return;
            el.style.setProperty('--game-accent', theme.accent);
            el.style.setProperty('--game-accent-2', theme.accent2);
            el.style.setProperty('--game-accent-glow', theme.accent + '73');
        });
        const iconEl = document.getElementById('start-game-icon');
        if (iconEl) iconEl.textContent = theme.icon;
        overlayStart.classList.remove('card-animate-in');
        void overlayStart.offsetWidth;
        overlayStart.classList.add('card-animate-in');
    }

    function updateStartCard({ title, subtitle, desc, mode }) {
        const titleEl = document.getElementById('start-game-title');
        const subtitleEl = document.getElementById('start-game-subtitle');
        const descEl = document.getElementById('start-game-desc');
        const typeBadge = document.getElementById('start-game-type-badge');
        const diffBadge = document.getElementById('start-game-diff-badge');

        if (titleEl) titleEl.textContent = title;
        if (subtitleEl) subtitleEl.textContent = subtitle || '';
        if (descEl) descEl.textContent = desc;

        readTrainingConfig();
        const formatLabels = { arcade: 'ARCADE', customisable: 'DISCIPLINE', marathon: 'MARATHON' };
        if (typeBadge) typeBadge.textContent = formatLabels[trainingConfig.format] || 'ARCADE';
        if (diffBadge) {
            diffBadge.textContent = trainingConfig.difficulty.toUpperCase();
            diffBadge.style.borderColor = trainingConfig.difficulty === 'extreme' ? '#ff0055' : trainingConfig.difficulty === 'hard' ? '#ffb800' : 'var(--game-accent)';
            diffBadge.style.color = trainingConfig.difficulty === 'extreme' ? '#ff0055' : trainingConfig.difficulty === 'hard' ? '#ffb800' : 'var(--game-accent)';
        }

        applyGameTheme(mode || gameMode);
    }

    function isDisciplineMode(mode) {
        return DISCIPLINE_MODES.includes(mode || gameMode);
    }

    function getDifficultyMods() {
        const diff = trainingConfig.difficulty;
        if (diff === 'extreme') {
            return { seqBonus: 4, flashMult: 0.4, lives: 1, countdown: 1, digitBonus: 4, amountMult: 1.5, memoMult: 0.6, recallMult: 0.7 };
        }
        if (diff === 'hard') {
            return { seqBonus: 2, flashMult: 0.6, lives: 2, countdown: 2, digitBonus: 2, amountMult: 1.25, memoMult: 0.75, recallMult: 0.8 };
        }
        return { seqBonus: 0, flashMult: 1, lives: 3, countdown: 3, digitBonus: 0, amountMult: 1, memoMult: 1, recallMult: 1 };
    }

    function readTrainingConfig() {
        const skinRadio = document.querySelector('input[name="training-skin"]:checked');
        const memoMin = parseInt(document.getElementById('custom-memo-min').value) || 0;
        const memoSec = parseInt(document.getElementById('custom-memo-sec').value) || 0;
        const recallMin = parseInt(document.getElementById('custom-recall-min').value) || 1;
        const recallSec = parseInt(document.getElementById('custom-recall-sec').value) || 0;
        trainingConfig = {
            format: trainingFormatEl.value,
            discipline: trainingDisciplineEl.value,
            difficulty: trainingDifficultyEl.value,
            skin: skinRadio ? skinRadio.value : 'analogue',
            amount: parseInt(document.getElementById('custom-amount').value) || 100,
            grouping: document.getElementById('custom-grouping').value || '3',
            memoSeconds: Math.max(15, memoMin * 60 + memoSec),
            recallSeconds: Math.max(30, recallMin * 60 + recallSec)
        };
    }

    function updateTrainingUI() {
        readTrainingConfig();
        const isCustom = trainingConfig.format === 'customisable';
        const isMarathon = trainingConfig.format === 'marathon';
        customSettingsPanel.classList.toggle('hidden', !isCustom);
        disciplineRow.classList.toggle('hidden', !isCustom);
        skinRow.classList.toggle('hidden', !isCustom && !isMarathon);
        arcadeSelectorBar.classList.toggle('hidden', isCustom || isMarathon);

        if (isCustom && !gameActive) {
            gameMode = trainingConfig.discipline;
            updateStartCard({
                title: trainingConfig.discipline.toUpperCase(),
                subtitle: '(CUSTOMISABLE)',
                desc: `Hard memory discipline — ${trainingConfig.difficulty} mode. Memorize the full sequence, then recall it before time runs out.`,
                mode: trainingConfig.discipline
            });
        } else if (isMarathon && !gameActive) {
            updateStartCard({
                title: 'MULTI-TASK MARATHON',
                subtitle: `${MARATHON_TASKS.length} TASKS`,
                desc: `Complete ${MARATHON_TASKS.length} hard tasks across all disciplines and arcade drills.`,
                mode: 'Marathon'
            });
        } else if (!gameActive) {
            const cfg = modeButtons.find(b => b.mode === gameMode);
            if (cfg) {
                const diffLabel = trainingConfig.difficulty !== 'standard' ? ` (${trainingConfig.difficulty.toUpperCase()})` : '';
                updateStartCard({
                    title: cfg.title,
                    subtitle: diffLabel ? diffLabel.replace(/[()]/g, '') : 'ARCADE DRILL',
                    desc: cfg.desc + (trainingConfig.difficulty !== 'standard' ? ' Harder sequences, faster flashes, fewer lives.' : ''),
                    mode: gameMode
                });
            }
        }
    }

    [trainingFormatEl, trainingDisciplineEl, trainingDifficultyEl].forEach(el => {
        if (el) el.addEventListener('change', () => { updateTrainingUI(); if (!gameActive) buildBoardGrid(); });
    });
    document.querySelectorAll('input[name="training-skin"]').forEach(el => {
        el.addEventListener('change', updateTrainingUI);
    });
    ['custom-amount', 'custom-grouping', 'custom-memo-min', 'custom-memo-sec', 'custom-recall-min', 'custom-recall-sec'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', readTrainingConfig);
    });

    function getScaledAmount() {
        const mods = getDifficultyMods();
        const base = trainingConfig.amount + (level - 1) * 20;
        return Math.min(500, Math.floor(base * mods.amountMult));
    }

    function parseGrouping(pattern) {
        if (!pattern || !pattern.includes('-')) {
            const n = parseInt(pattern) || 3;
            return [n];
        }
        return pattern.split('-').map(v => parseInt(v) || 3);
    }

    function generateDisciplineContent(mode) {
        const amount = getScaledAmount();
        if (mode === 'Numbers') {
            let digits = '';
            for (let i = 0; i < amount; i++) digits += Math.floor(Math.random() * 10);
            return digits;
        }
        if (mode === 'Binary') {
            let bits = '';
            for (let i = 0; i < amount; i++) bits += Math.random() < 0.5 ? '0' : '1';
            return bits;
        }
        if (mode === 'Words') {
            const count = Math.min(30, Math.max(8, Math.floor(amount / 4)));
            const words = [];
            const pool = [...WORD_POOL];
            for (let i = 0; i < count; i++) {
                const idx = Math.floor(Math.random() * pool.length);
                words.push(pool[idx]);
                pool.splice(idx, 1);
                if (pool.length === 0) pool.push(...WORD_POOL);
            }
            return words.join(' ');
        }
        if (mode === 'Dates') {
            const count = Math.min(20, Math.max(6, Math.floor(amount / 8)));
            const pairs = [];
            for (let i = 0; i < count; i++) {
                const year = 1800 + Math.floor(Math.random() * 220);
                const event = DATE_EVENTS[Math.floor(Math.random() * DATE_EVENTS.length)];
                pairs.push(`${event}:${year}`);
            }
            return pairs.join('|');
        }
        if (mode === 'Cards' || mode === 'Cards Recall') {
            const count = Math.min(52, Math.max(12, Math.floor(amount / 3)));
            const cards = [];
            for (let i = 0; i < count; i++) {
                const rank = CARD_RANKS[Math.floor(Math.random() * CARD_RANKS.length)];
                const suit = CARD_SUITS[Math.floor(Math.random() * CARD_SUITS.length)];
                cards.push(rank + suit);
            }
            return cards.join(' ');
        }
        if (mode === 'Images') {
            const count = Math.min(40, Math.max(10, Math.floor(amount / 3)));
            const imgs = [];
            for (let i = 0; i < count; i++) {
                imgs.push(IMAGE_SYMBOLS[Math.floor(Math.random() * IMAGE_SYMBOLS.length)]);
            }
            return imgs.join(' ');
        }
        if (mode === 'Names & Faces') {
            const count = Math.min(16, Math.max(6, Math.floor(amount / 8)));
            const pairs = [];
            const usedNames = [];
            for (let i = 0; i < count; i++) {
                const face = FACE_EMOJIS[i % FACE_EMOJIS.length];
                let name = FACE_NAMES[Math.floor(Math.random() * FACE_NAMES.length)];
                while (usedNames.includes(name)) name = FACE_NAMES[Math.floor(Math.random() * FACE_NAMES.length)];
                usedNames.push(name);
                pairs.push(`${face}~${name}`);
            }
            return pairs.join('|');
        }
        return '';
    }

    function formatDisciplineDisplay(content, mode) {
        const skin = trainingConfig.skin;
        const tone = getModeSlug(mode);
        const grouping = parseGrouping(trainingConfig.grouping);
        const toneClass = `tone-${tone}`;
        let html = `<div class="discipline-memo-panel skin-${skin} ${toneClass}">`;

        if (mode === 'Names & Faces') {
            html += '<div class="discipline-pair-grid">';
            content.split('|').forEach(pair => {
                const [face, name] = pair.split('~');
                html += `<div class="discipline-pair-card skin-${skin} ${toneClass}"><div class="pair-face">${face}</div><div class="pair-label">${name}</div></div>`;
            });
            html += '</div>';
        } else if (mode === 'Dates') {
            html += '<div class="discipline-pair-grid">';
            content.split('|').forEach(pair => {
                const [event, year] = pair.split(':');
                html += `<div class="discipline-pair-card skin-${skin} ${toneClass}"><div class="pair-label">${event}</div><div class="pair-face" style="font-size:1.4rem">${year}</div></div>`;
            });
            html += '</div>';
        } else if (mode === 'Words' || mode === 'Cards' || mode === 'Cards Recall' || mode === 'Images') {
            const items = content.split(' ');
            let gi = 0;
            let inGroup = 0;
            html += '<span>';
            items.forEach((item, idx) => {
                if (inGroup === 0) html += '<span class="discipline-group">';
                html += item + ' ';
                inGroup++;
                const gSize = grouping[gi % grouping.length];
                if (inGroup >= gSize) {
                    html += '</span>';
                    inGroup = 0;
                    gi++;
                }
            });
            if (inGroup > 0) html += '</span>';
            html += '</span>';
        } else {
            let gi = 0;
            let inGroup = 0;
            const lineEvery = Math.max(30, grouping.reduce((a, b) => a + b, 0) * 4);
            for (let i = 0; i < content.length; i++) {
                if (inGroup === 0) html += '<span class="discipline-group">';
                html += content[i];
                inGroup++;
                const gSize = grouping[gi % grouping.length];
                if (inGroup >= gSize) {
                    html += '</span>';
                    inGroup = 0;
                    gi++;
                }
                if ((i + 1) % lineEvery === 0) html += '<span class="discipline-line-break"></span>';
            }
            if (inGroup > 0) html += '</span>';
        }
        html += '</div>';
        return html;
    }

    function normalizeRecallInput(input, mode) {
        const cleaned = input.trim().replace(/\s+/g, ' ');
        if (mode === 'Numbers' || mode === 'Binary') return cleaned.replace(/\s/g, '');
        if (mode === 'Dates') return cleaned.replace(/\s*\|\s*/g, '|').toLowerCase();
        if (mode === 'Names & Faces') return cleaned.replace(/\s*\|\s*/g, '|').replace(/,/g, '|').toLowerCase();
        return cleaned.toLowerCase();
    }

    function normalizeDisciplineAnswer(answer, mode) {
        if (mode === 'Numbers' || mode === 'Binary') return answer.replace(/\s/g, '');
        if (mode === 'Dates') return answer.toLowerCase();
        if (mode === 'Names & Faces') {
            return answer.split('|').map(p => p.split('~')[1] || p).join('|').toLowerCase();
        }
        return answer.toLowerCase();
    }

    function getRecallPlaceholder(mode) {
        const placeholders = {
            'Numbers': 'Type all digits in order (no spaces)...',
            'Binary': 'Type all binary digits in order...',
            'Words': 'Type all words separated by spaces...',
            'Dates': 'event:year pairs separated by | e.g. Moon Landing:1969|...',
            'Cards': 'Type cards separated by spaces e.g. AS KH 10D...',
            'Cards Recall': 'Type cards in memorized order...',
            'Images': 'Type symbols separated by spaces...',
            'Names & Faces': 'Type names in order separated by | e.g. Alex|Jordan|Sam...'
        };
        return placeholders[mode] || 'Enter your recall...';
    }

    function setMarathonTask() {
        const task = MARATHON_TASKS[marathonTaskIndex % MARATHON_TASKS.length];
        gameMode = task.mode;
        updateTaskHUD();
        if (task.type === 'discipline') {
            updateStartCard({
                title: task.mode.toUpperCase(),
                subtitle: `TASK ${marathonTaskIndex + 1} / ${MARATHON_TASKS.length}`,
                desc: `Marathon task ${marathonTaskIndex + 1} of ${MARATHON_TASKS.length}. Complete all disciplines and arcade drills.`,
                mode: task.mode
            });
        } else {
            const cfg = modeButtons.find(b => b.mode === task.mode);
            if (cfg) {
                updateStartCard({
                    title: cfg.title,
                    subtitle: `TASK ${marathonTaskIndex + 1} / ${MARATHON_TASKS.length}`,
                    desc: `Marathon arcade drill — ${cfg.desc}`,
                    mode: task.mode
                });
            }
        }
    }

    function updateTaskHUD() {
        const taskEl = document.getElementById('game-task');
        if (trainingConfig.format === 'marathon') {
            document.getElementById('hud-task-item').style.display = '';
            taskEl.textContent = `${(marathonTaskIndex % MARATHON_TASKS.length) + 1} / ${MARATHON_TASKS.length}`;
        } else if (trainingConfig.format === 'customisable') {
            document.getElementById('hud-task-item').style.display = '';
            taskEl.textContent = `L${level}`;
        } else {
            document.getElementById('hud-task-item').style.display = 'none';
        }
    }

    function clearRecallTimer() {
        if (recallTimerInterval) {
            clearInterval(recallTimerInterval);
            recallTimerInterval = null;
        }
    }

    function startDisciplineRecall() {
        const mods = getDifficultyMods();
        const recallSecs = Math.floor(trainingConfig.recallSeconds * mods.recallMult);
        let remaining = recallSecs;

        overlay.classList.add('hidden'); // Fix: hide overlay so recall inputs are fully visible and interactive

        const hudTimerItem = document.getElementById('hud-timer-item');
        const hudTimerVal = document.getElementById('game-timer');
        if (hudTimerItem && hudTimerVal) {
            hudTimerItem.style.display = '';
            hudTimerVal.textContent = formatTime(remaining);
        }

        clearRecallTimer();
        recallTimerInterval = setInterval(() => {
            remaining--;
            if (hudTimerVal) {
                hudTimerVal.textContent = formatTime(Math.max(0, remaining));
            }
            if (remaining <= 0) {
                clearRecallTimer();
                if (hudTimerItem) hudTimerItem.style.display = 'none';
                handleWrongRecall();
            }
        }, 1000);

        board.innerHTML = '';
        board.classList.add('discipline-board');
        const tone = getModeSlug(gameMode);
        const container = document.createElement('div');
        container.classList.add('discipline-recall-container', `tone-${tone}`);
        container.innerHTML = `
            <label for="discipline-recall-field">RECALL ${gameMode.toUpperCase()}</label>
            <textarea id="discipline-recall-field" class="discipline-recall-field" placeholder="${getRecallPlaceholder(gameMode)}"></textarea>
            <button id="discipline-recall-submit" class="btn game-card-btn">SUBMIT RECALL</button>
        `;
        board.appendChild(container);

        const field = document.getElementById('discipline-recall-field');
        const submitBtn = document.getElementById('discipline-recall-submit');
        field.focus();

        const processRecall = () => {
            clearRecallTimer();
            if (hudTimerItem) hudTimerItem.style.display = 'none';
            const typed = normalizeRecallInput(field.value, gameMode);
            const expected = normalizeDisciplineAnswer(disciplineContent, gameMode);
            if (typed === expected) {
                handleSuccess();
            } else {
                container.innerHTML = `
                    <h3 class="glow-magenta">RECALL ERROR</h3>
                    <p style="color:var(--text-secondary);font-size:0.85rem;word-break:break-all;max-height:120px;overflow:auto;">Expected: ${disciplineContent.substring(0, 80)}${disciplineContent.length > 80 ? '...' : ''}</p>
                    <p style="color:var(--neon-magenta)">LIVES DECREASED</p>
                `;
                handleWrongRecall();
            }
        };

        submitBtn.addEventListener('click', processRecall);
        field.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) processRecall();
        });
        isAcceptingInputs = true;
    }

    function startDisciplineMemo() {
        const mods = getDifficultyMods();
        disciplineContent = generateDisciplineContent(gameMode);
        disciplineRecallAnswer = disciplineContent;

        setPlayingTone(gameMode);
        gameBoardWrapper.classList.add('discipline-mode');
        board.classList.add('discipline-board');
        board.innerHTML = formatDisciplineDisplay(disciplineContent, gameMode);

        overlay.classList.add('hidden'); // Fix: hide overlay so numbers/words are visible to memorize

        const hudTimerItem = document.getElementById('hud-timer-item');
        const hudTimerVal = document.getElementById('game-timer');
        let memoSecs = Math.floor(trainingConfig.memoSeconds * mods.memoMult);

        if (hudTimerItem && hudTimerVal) {
            hudTimerItem.style.display = '';
            hudTimerVal.textContent = formatTime(memoSecs);
        }

        if (memoInterval) clearInterval(memoInterval);
        memoInterval = setInterval(() => {
            memoSecs--;
            if (hudTimerVal) {
                hudTimerVal.textContent = formatTime(Math.max(0, memoSecs));
            }
            if (memoSecs <= 0) {
                clearInterval(memoInterval);
                memoInterval = null;
                if (hudTimerItem) hudTimerItem.style.display = 'none';
                board.innerHTML = '';
                startDisciplineRecall();
            }
        }, 1000);
    }

    // Toggle Game Modes
    const modeButtons = [
        { btn: modeGridBtn, mode: 'Grid Flash', title: 'GRID RECALL', desc: 'Watch the flashing patterns, memorize their positions, then select them in any order.' },
        { btn: modeSequenceBtn, mode: 'Number Sequence', title: 'NUMBER SEQUENCE', desc: 'Tiles will reveal random ascending numbers. Memorize their positions and click in numeric order (1 → 2 → 3...).' },
        { btn: modeCardsBtn, mode: 'Card Match', title: 'CARD MATCH', desc: 'Cards will flip open briefly. Memorize the matching emoji pairs and match them up.' },
        { btn: modeRepeatBtn, mode: 'Sequence Repeat', title: 'SEQUENCE REPEAT', desc: 'Watch the tiles flash one by one, then click them in the EXACT same sequence order.' },
        { btn: modeSpeedBtn, mode: 'Speed Numbers', title: 'SPEED NUMBERS', desc: 'A long digit code will flash on screen. Memorize it, then enter it correctly to crack the sequence.' }
    ];

    modeButtons.forEach(cfg => {
        if (!cfg.btn) return;
        cfg.btn.addEventListener('click', () => {
            if (gameActive) return;
            readTrainingConfig();
            if (trainingConfig.format === 'customisable') return;
            gameMode = cfg.mode;
            
            modeButtons.forEach(b => {
                if (b.btn) b.btn.classList.remove('active');
            });
            cfg.btn.classList.add('active');
            
            const diffLabel = trainingConfig.difficulty !== 'standard' ? trainingConfig.difficulty.toUpperCase() : '';
            updateStartCard({
                title: cfg.title,
                subtitle: diffLabel || 'ARCADE DRILL',
                desc: cfg.desc + (trainingConfig.difficulty !== 'standard' ? ' Harder sequences, faster flashes, fewer lives.' : ''),
                mode: cfg.mode
            });
            playSound('click');
            buildBoardGrid();
        });
    });

    updateTrainingUI();

    // Build standard game board layout
    function buildBoardGrid() {
        readTrainingConfig();
        board.classList.remove('discipline-board');
        gameBoardWrapper.classList.remove('discipline-mode');

        if (isDisciplineMode() && (trainingConfig.format === 'customisable' || trainingConfig.format === 'marathon')) {
            board.style.display = 'block';
            board.innerHTML = '';
            return;
        }

        board.style.display = 'grid';
        const config = DB.getConfig();
        const size = (gameMode === 'Card Match') ? 4 : (config.gridSize || 4);
        board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${size}, 1fr)`;
        board.innerHTML = '';
        
        const totalTiles = size * size;
        for (let i = 0; i < totalTiles; i++) {
            const tile = document.createElement('div');
            tile.classList.add('tile');
            tile.setAttribute('data-idx', i);
            
            if (gameMode === 'Card Match') {
                tile.classList.add('card-back');
            }
            
            tile.addEventListener('click', () => handleTileClick(tile, i));
            board.appendChild(tile);
        }
    }
    buildBoardGrid(); // initial setup

    // Helper to clear all game timers/intervals/timeouts
    function clearAllGameTimers() {
        clearRecallTimer();
        if (memoInterval) {
            clearInterval(memoInterval);
            memoInterval = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
        }
        if (simonTimeout) {
            clearTimeout(simonTimeout);
            simonTimeout = null;
        }
        if (flashTimeout) {
            clearTimeout(flashTimeout);
            flashTimeout = null;
        }
    }

    // Abort active training run
    function abortGame() {
        playSound('fail');
        gameActive = false;
        isAcceptingInputs = false;
        clearAllGameTimers();
        
        // Reset setup panel
        const setupPanel = document.getElementById('training-setup-panel');
        if (setupPanel) {
            setupPanel.style.pointerEvents = '';
            setupPanel.style.opacity = '';
        }
        
        // Reset board layouts
        clearPlayingTone();
        board.classList.remove('discipline-board');
        gameBoardWrapper.classList.remove('discipline-mode');
        buildBoardGrid();
        
        // Reset overlays back to start state
        overlay.classList.remove('hidden');
        overlayStart.classList.remove('hidden');
        overlayCalibration.classList.add('hidden');
        overlayMemorize.classList.add('hidden');
        overlayRecall.classList.add('hidden');
        overlayGameOver.classList.add('hidden');
        
        // Hide game-specific HUD items
        const hudTimerItem = document.getElementById('hud-timer-item');
        if (hudTimerItem) hudTimerItem.style.display = 'none';
        const hudExitItem = document.getElementById('hud-exit-item');
        if (hudExitItem) hudExitItem.style.display = 'none';
        
        updateTrainingUI();
    }

    // Start Training Cycle
    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    const exitBtn = document.getElementById('exit-game-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', abortGame);
    }

    function startGame() {
        playSound('click');
        readTrainingConfig();
        clearAllGameTimers();
        gameActive = true;
        document.getElementById('training-setup-panel').style.pointerEvents = 'none';
        document.getElementById('training-setup-panel').style.opacity = '0.6';
        level = 1;
        score = 0;
        marathonTaskIndex = 0;

        const mods = getDifficultyMods();
        lives = mods.lives;

        if (trainingConfig.format === 'marathon') {
            setMarathonTask();
        } else if (trainingConfig.format === 'customisable') {
            gameMode = trainingConfig.discipline;
        }

        // Show/hide game run specific HUD elements
        const hudExitItem = document.getElementById('hud-exit-item');
        if (hudExitItem) hudExitItem.style.display = '';
        const hudTimerItem = document.getElementById('hud-timer-item');
        if (hudTimerItem) hudTimerItem.style.display = 'none';

        updateGameHUD();
        updateTaskHUD();
        
        // --- PRE-GAME NEURAL CALIBRATION ANIMATION ---
        isAcceptingInputs = false;
        
        overlay.classList.remove('hidden');
        overlayStart.classList.add('hidden');
        overlayGameOver.classList.add('hidden');
        overlayMemorize.classList.add('hidden');
        overlayCalibration.classList.remove('hidden');
        
        const progressBar = document.getElementById('calibration-progress');
        const logsDiv = document.getElementById('calibration-logs');
        
        progressBar.style.width = '0%';
        logsDiv.innerHTML = '';
        
        buildBoardGrid(); // generate blank board first
        
        const logMessages = [
            { t: 0, txt: '> INITIALIZING NEURAL SYNC MODULE...', type: 'info' },
            { t: 250, txt: '> COGNITIVE CORE SCANNING... [OK]', type: 'ok' },
            { t: 550, txt: '> CONFIGURING COGNITIVE FREQUENCY PATTERNS...', type: 'info' },
            { t: 850, txt: '> SYNC RATE AT STABLE 120Hz LATENCY... [OK]', type: 'ok' },
            { t: 1150, txt: '> SECURE PROTOCOLS LOADED', type: 'info' },
            { t: 1400, txt: '> CONNECTION COMPLETE. INITIATING CORE RUN.', type: 'ok' }
        ];

        // Animate log console inputs
        logMessages.forEach(msg => {
            setTimeout(() => {
                if (!gameActive) return;
                const p = document.createElement('div');
                p.classList.add('log-line');
                if (msg.type === 'ok') p.classList.add('log-ok');
                p.textContent = msg.txt;
                logsDiv.appendChild(p);
                logsDiv.scrollTop = logsDiv.scrollHeight;
                
                playSound('click');
            }, msg.t);
        });

        // Fill loading progress bar
        let pct = 0;
        const barInterval = setInterval(() => {
            if (!gameActive) {
                clearInterval(barInterval);
                return;
            }
            pct += 2;
            progressBar.style.width = `${pct}%`;
            if (pct >= 100) {
                clearInterval(barInterval);
            }
        }, 30);

        // Tile ripple scan visual effect
        const config = DB.getConfig();
        const size = (gameMode === 'Card Match') ? 4 : (config.gridSize || 4);
        const totalTiles = size * size;
        
        for (let i = 0; i < totalTiles; i++) {
            setTimeout(() => {
                if (!gameActive) return;
                const tile = board.querySelector(`.tile[data-idx="${i}"]`);
                if (tile) {
                    tile.classList.add('active-flash-purple');
                    setTimeout(() => {
                        tile.classList.remove('active-flash-purple');
                    }, 150);
                }
            }, i * 35);
        }

        // After loading bar fills, proceed to memorize countdown
        setTimeout(() => {
            if (!gameActive) return;
            overlayCalibration.classList.add('hidden');
            if (isDisciplineMode() && (trainingConfig.format === 'customisable' || trainingConfig.format === 'marathon')) {
                startDisciplineMemo();
            } else {
                startLevel();
            }
        }, 1800);
    }

    function startLevel() {
        isAcceptingInputs = false;
        userRecallSequence = [];
        numberRecallIndex = 1;
        selectedCards = [];
        matchedPairsCount = 0;
        clearRecallTimer();
        setPlayingTone(gameMode);
        board.classList.remove('discipline-board');
        gameBoardWrapper.classList.remove('discipline-mode');
        board.style.display = 'grid';

        const mods = getDifficultyMods();
        const config = DB.getConfig();
        const size = (gameMode === 'Card Match') ? 4 : (config.gridSize || 4);
        const totalTiles = size * size;
        
        if (gameMode === 'Card Match') {
            // Setup cards mapping
            const emojis = ['🚀', '🛸', '👾', '🪐', '🌀', '🔋', '🛡️', '⚔️'];
            const selectedEmojis = [...emojis]; // 8 unique emojis
            const deck = [...selectedEmojis, ...selectedEmojis]; // 16 cards
            
            // Shuffle deck
            for (let i = deck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [deck[i], deck[j]] = [deck[j], deck[i]];
            }
            cardPairsMap = deck;
        } else if (gameMode === 'Speed Numbers') {
            const length = Math.min(level + 3 + mods.digitBonus, trainingConfig.difficulty === 'extreme' ? 20 : trainingConfig.difficulty === 'hard' ? 16 : 12);
            let digits = '';
            for (let i = 0; i < length; i++) {
                digits += Math.floor(Math.random() * 10);
            }
            currentSpeedNumberString = digits;
        } else {
            const sequenceLength = level + 2 + mods.seqBonus;
            
            // Pick random unique indexes
            currentSequence = [];
            while (currentSequence.length < Math.min(sequenceLength, totalTiles - 1)) {
                const idx = Math.floor(Math.random() * totalTiles);
                if (!currentSequence.includes(idx)) {
                    currentSequence.push(idx);
                }
            }
        }

        // Display memorize countdown overlay
        overlay.classList.remove('hidden');
        overlayStart.classList.add('hidden');
        overlayGameOver.classList.add('hidden');
        overlayMemorize.classList.remove('hidden');
        
        document.getElementById('memorize-title').textContent = 'MEMORIZE GRID';
        document.getElementById('memorize-phase-label').textContent = trainingConfig.difficulty !== 'standard' ? `${trainingConfig.difficulty.toUpperCase()} MODE` : 'GET READY';

        let countdownVal = mods.countdown;
        const countTimer = document.getElementById('memorize-timer');
        countTimer.textContent = countdownVal;
        
        if (countdownInterval) clearInterval(countdownInterval);
        countdownInterval = setInterval(() => {
            countdownVal--;
            if (countdownVal <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                overlay.classList.add('hidden');
                triggerFlashSequence();
            } else {
                countTimer.textContent = countdownVal;
            }
        }, 700);
    }

    // Flash patterns on screen
    function triggerFlashSequence() {
        buildBoardGrid(); // clean slate
        
        const config = DB.getConfig();
        const mods = getDifficultyMods();
        const scaledFlashDuration = Math.max(
            200, 
            (config.flashDuration * mods.flashMult) / Math.pow(config.difficultyScale, level - 1)
        );

        if (gameMode === 'Grid Flash') {
            // Flash all tiles in sequence simultaneously
            currentSequence.forEach(idx => {
                const tile = board.querySelector(`.tile[data-idx="${idx}"]`);
                if (tile) tile.classList.add('active-flash');
            });

            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                currentSequence.forEach(idx => {
                    const tile = board.querySelector(`.tile[data-idx="${idx}"]`);
                    if (tile) tile.classList.remove('active-flash');
                });
                isAcceptingInputs = true;
            }, scaledFlashDuration);
            
        } else if (gameMode === 'Number Sequence') {
            // Display numbers on the grid
            currentSequence.forEach((idx, order) => {
                const tile = board.querySelector(`.tile[data-idx="${idx}"]`);
                if (tile) {
                    tile.classList.add('active-flash-purple');
                    const numSpan = document.createElement('span');
                    numSpan.classList.add('tile-number');
                    numSpan.textContent = order + 1; // 1-indexed for display
                    tile.appendChild(numSpan);
                }
            });

            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                currentSequence.forEach(idx => {
                    const tile = board.querySelector(`.tile[data-idx="${idx}"]`);
                    if (tile) {
                        tile.classList.remove('active-flash-purple');
                        const span = tile.querySelector('.tile-number');
                        if (span) span.classList.add('hidden-num'); // hide the numbers, they must memorize where they were!
                    }
                });
                isAcceptingInputs = true;
            }, scaledFlashDuration + 400); // give slightly more time for numbers
            
        } else if (gameMode === 'Card Match') {
            // In Card Match, we reveal all cards face up for standard preview duration
            const tiles = board.querySelectorAll('.tile');
            tiles.forEach(tile => {
                const idx = parseInt(tile.getAttribute('data-idx'));
                tile.classList.remove('card-back');
                tile.classList.add('card-flipped');
                const emojiSpan = document.createElement('span');
                emojiSpan.classList.add('card-emoji');
                emojiSpan.textContent = cardPairsMap[idx];
                tile.appendChild(emojiSpan);
            });

            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                // Flip all back down
                tiles.forEach(tile => {
                    tile.classList.remove('card-flipped');
                    tile.classList.add('card-back');
                    const emojiSpan = tile.querySelector('.card-emoji');
                    if (emojiSpan) emojiSpan.remove();
                });
                isAcceptingInputs = true;
            }, Math.max(800, (3000 * mods.flashMult) / Math.pow(config.difficultyScale, level - 1)));
            
        } else if (gameMode === 'Sequence Repeat') {
            // Simon says: flash tiles one by one sequentially
            let i = 0;
            isAcceptingInputs = false;
            
            const seqDelay = Math.max(200, 500 / Math.pow(config.difficultyScale, level - 1));
            
            function flashNextTile() {
                if (!gameActive) return;
                if (i >= currentSequence.length) {
                    isAcceptingInputs = true;
                    return;
                }
                
                const idx = currentSequence[i];
                const tile = board.querySelector(`.tile[data-idx="${idx}"]`);
                if (tile) {
                    tile.classList.add('flash-repeat-cyan');
                    playSound('click');
                    flashTimeout = setTimeout(() => {
                        if (!gameActive) return;
                        tile.classList.remove('flash-repeat-cyan');
                        i++;
                        simonTimeout = setTimeout(flashNextTile, seqDelay / 2);
                    }, seqDelay);
                } else {
                    i++;
                    simonTimeout = setTimeout(flashNextTile, 0);
                }
            }
            
            // start Simon says cycle
            simonTimeout = setTimeout(flashNextTile, 500);

        } else if (gameMode === 'Speed Numbers') {
            // Display digits centered on the board
            const displayDiv = document.createElement('div');
            displayDiv.classList.add('speed-number-val-display');
            displayDiv.textContent = currentSpeedNumberString;
            board.appendChild(displayDiv);
            
            playSound('success');

            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                displayDiv.remove();
                
                // Render text input container inside board
                const inputContainer = document.createElement('div');
                inputContainer.classList.add('speed-numbers-input-container');
                inputContainer.innerHTML = `
                    <label for="speed-numbers-field">DECRYPT THE KEY CODE</label>
                    <input type="text" id="speed-numbers-field" class="speed-numbers-field" autocomplete="off" maxlength="24" placeholder="TYPE DIGITS">
                    <button id="speed-numbers-submit" class="btn btn-primary btn-mini btn-glow">SUBMIT KEYCODE</button>
                `;
                board.appendChild(inputContainer);
                
                const inputField = document.getElementById('speed-numbers-field');
                inputField.focus();
                
                // Submit action triggers
                const submitBtn = document.getElementById('speed-numbers-submit');
                
                const processSubmit = () => {
                    const typed = inputField.value.trim();
                    if (typed === currentSpeedNumberString) {
                        handleSuccess();
                    } else {
                        // Display error feedback on the container
                        inputContainer.innerHTML = `
                            <h3 class="glow-magenta">DECRYPTION ERROR</h3>
                            <p style="color:var(--text-primary); font-size:1.4rem; font-family:monospace; letter-spacing:2px;">CORRECT: ${currentSpeedNumberString}</p>
                            <p style="color:var(--neon-magenta); font-size:1.1rem">LIVES DECREASED</p>
                        `;
                        handleWrongRecall();
                    }
                };
                
                submitBtn.addEventListener('click', processSubmit);
                inputField.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        processSubmit();
                    }
                });
                
                isAcceptingInputs = true;
            }, scaledFlashDuration + 1500); // give enough time to memorize digits
        }
    }

    // Capture User Clicks
    function handleTileClick(tile, index) {
        if (!gameActive || !isAcceptingInputs) return;
        
        // Prevent clicking already guessed active/success tiles
        if (tile.classList.contains('correct') || tile.classList.contains('wrong') || tile.classList.contains('card-matched')) return;

        if (gameMode === 'Grid Flash') {
            playSound('click');
            if (currentSequence.includes(index)) {
                tile.classList.add('correct');
                userRecallSequence.push(index);
                
                // Completed the pattern?
                if (userRecallSequence.length === currentSequence.length) {
                    handleSuccess();
                }
            } else {
                tile.classList.add('wrong');
                handleWrongRecall();
            }
            
        } else if (gameMode === 'Number Sequence') {
            playSound('click');
            // Find target tile which has the active number index
            const expectedIndex = currentSequence[numberRecallIndex - 1];
            
            if (index === expectedIndex) {
                tile.classList.add('correct');
                // Show the hidden number
                const span = tile.querySelector('.tile-number');
                if (span) span.classList.remove('hidden-num');
                
                numberRecallIndex++;
                if (numberRecallIndex > currentSequence.length) {
                    handleSuccess();
                }
            } else {
                tile.classList.add('wrong');
                // Reveal correct digit position
                const expectedTile = board.querySelector(`.tile[data-idx="${expectedIndex}"]`);
                if (expectedTile) {
                    expectedTile.classList.add('correct');
                    const span = expectedTile.querySelector('.tile-number');
                    if (span) span.classList.remove('hidden-num');
                }
                handleWrongRecall();
            }
            
        } else if (gameMode === 'Card Match') {
            // Clicked a card back card
            if (selectedCards.length >= 2 || tile.classList.contains('card-flipped')) return;
            
            playSound('click');
            
            // Flip card face up
            tile.classList.remove('card-back');
            tile.classList.add('card-flipped');
            const emojiSpan = document.createElement('span');
            emojiSpan.classList.add('card-emoji');
            emojiSpan.textContent = cardPairsMap[index];
            tile.appendChild(emojiSpan);
            
            selectedCards.push({ tile, index });
            
            if (selectedCards.length === 2) {
                const first = selectedCards[0];
                const second = selectedCards[1];
                
                isAcceptingInputs = false;
                
                if (cardPairsMap[first.index] === cardPairsMap[second.index]) {
                    // Match!
                    setTimeout(() => {
                        first.tile.classList.remove('card-flipped');
                        first.tile.classList.add('card-matched');
                        second.tile.classList.remove('card-flipped');
                        second.tile.classList.add('card-matched');
                        
                        matchedPairsCount++;
                        playSound('success');
                        
                        selectedCards = [];
                        isAcceptingInputs = true;
                        
                        if (matchedPairsCount === 8) { // 8 pairs matched (all 16 cards)
                            handleSuccess();
                        }
                    }, 500);
                } else {
                    // Mismatch!
                    setTimeout(() => {
                        first.tile.classList.remove('card-flipped');
                        first.tile.classList.add('card-back');
                        const e1 = first.tile.querySelector('.card-emoji');
                        if (e1) e1.remove();
                        
                        second.tile.classList.remove('card-flipped');
                        second.tile.classList.add('card-back');
                        const e2 = second.tile.querySelector('.card-emoji');
                        if (e2) e2.remove();
                        
                        selectedCards = [];
                        isAcceptingInputs = true;
                        
                        handleWrongRecall();
                    }, 1000);
                }
            }

        } else if (gameMode === 'Sequence Repeat') {
            playSound('click');
            userRecallSequence.push(index);
            const clickIndex = userRecallSequence.length - 1;
            
            // Check if correct click
            if (index === currentSequence[clickIndex]) {
                tile.classList.add('correct');
                // clear correct indicator shortly so it looks clean
                setTimeout(() => {
                    tile.classList.remove('correct');
                }, 200);
                
                if (userRecallSequence.length === currentSequence.length) {
                    handleSuccess();
                }
            } else {
                tile.classList.add('wrong');
                handleWrongRecall();
            }
        }
    }

    function handleSuccess() {
        isAcceptingInputs = false;
        playSound('success');
        clearRecallTimer();

        const diffBonus = trainingConfig.difficulty === 'extreme' ? 500 : trainingConfig.difficulty === 'hard' ? 250 : 0;
        score += level * 1000 + (lives * 250) + diffBonus;
        updateGameHUD();

        readTrainingConfig();

        if (trainingConfig.format === 'marathon') {
            marathonTaskIndex++;
            if (marathonTaskIndex >= MARATHON_TASKS.length) {
                marathonTaskIndex = 0;
                level++;
            }
            setMarathonTask();
            updateTaskHUD();
            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                if (isDisciplineMode()) {
                    startDisciplineMemo();
                } else {
                    startLevel();
                }
            }, 1000);
            return;
        }

        if (trainingConfig.format === 'customisable' && isDisciplineMode()) {
            level++;
            updateTaskHUD();
            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                startDisciplineMemo();
            }, 1000);
            return;
        }

        level++;
        flashTimeout = setTimeout(() => {
            if (!gameActive) return;
            startLevel();
        }, 1000);
    }

    function handleWrongRecall() {
        isAcceptingInputs = false;
        playSound('fail');
        clearRecallTimer();
        lives--;
        updateGameHUD();
        
        if (lives <= 0) {
            handleGameOver();
        } else {
            flashTimeout = setTimeout(() => {
                if (!gameActive) return;
                readTrainingConfig();
                if (isDisciplineMode() && (trainingConfig.format === 'customisable' || trainingConfig.format === 'marathon')) {
                    startDisciplineMemo();
                } else {
                    startLevel();
                }
            }, 1200);
        }
    }

    function handleGameOver() {
        gameActive = false;
        playSound('gameover');
        clearAllGameTimers();
        document.getElementById('training-setup-panel').style.pointerEvents = '';
        document.getElementById('training-setup-panel').style.opacity = '';
        clearPlayingTone();
        board.classList.remove('discipline-board');
        gameBoardWrapper.classList.remove('discipline-mode');
        
        // Hide game HUD items
        const hudTimerItem = document.getElementById('hud-timer-item');
        if (hudTimerItem) hudTimerItem.style.display = 'none';
        const hudExitItem = document.getElementById('hud-exit-item');
        if (hudExitItem) hudExitItem.style.display = 'none';

        overlay.classList.remove('hidden');
        overlayStart.classList.add('hidden');
        overlayMemorize.classList.add('hidden');
        overlayRecall.classList.add('hidden');
        
        const gameOverScreen = document.getElementById('overlay-gameover-content');
        gameOverScreen.classList.remove('hidden');
        
        document.getElementById('final-level').textContent = level;
        document.getElementById('final-score').textContent = score;

        readTrainingConfig();
        let recordedMode = gameMode;
        if (trainingConfig.format === 'marathon') {
            recordedMode = `Marathon (${trainingConfig.difficulty})`;
        } else if (trainingConfig.format === 'customisable') {
            recordedMode = `${gameMode} (${trainingConfig.difficulty})`;
        } else if (trainingConfig.difficulty !== 'standard') {
            recordedMode = `${gameMode} (${trainingConfig.difficulty})`;
        }

        const activeUser = DB.getCurrentUser();
        const username = activeUser ? activeUser.username : "Guest_Athlete";
        
        const runRecord = {
            username: username,
            gameMode: recordedMode,
            score: score,
            level: level,
            date: new Date().toISOString().split('T')[0]
        };
        DB.addScore(runRecord);

        // If logged in as User, reward XP & updates
        if (activeUser && activeUser.role === 'user') {
            const users = DB.getUsers();
            const matchingUser = users.find(u => u.id === activeUser.id);
            if (matchingUser) {
                // simple leveling progression: XP gained = score / 10
                const xpGain = Math.floor(score / 10);
                matchingUser.xp += xpGain;
                
                // level calculation
                while (matchingUser.xp >= matchingUser.level * 200) {
                    matchingUser.xp -= matchingUser.level * 200;
                    matchingUser.level++;
                }
                
                DB.saveUsers(users);
                DB.setCurrentUser(matchingUser); // Sync local state
                renderUserDashboard(); // reload statistics charts
            }
        }
    }

    function updateGameHUD() {
        document.getElementById('game-level').textContent = level;
        document.getElementById('game-score').textContent = score.toString().padStart(5, '0');
        updateTaskHUD();
        
        const heartIcons = document.querySelectorAll('.heart');
        heartIcons.forEach((heart, i) => {
            if (i < lives) {
                heart.classList.add('active');
            } else {
                heart.classList.remove('active');
            }
        });
    }

    // --- ATHLETE DASHBOARD GENERATOR ---
    function renderUserDashboard() {
        const user = DB.getCurrentUser();
        if (!user || user.role !== 'user') return;

        // Welcome Tag
        document.getElementById('user-dash-welcome').textContent = `WELCOME BACK, ${user.username.toUpperCase()}`;
        document.getElementById('user-dash-level').textContent = `Level ${user.level}`;
        
        // Progress bar XP math
        const nextLevelXPThreshold = user.level * 200;
        const progressPercent = Math.min(100, Math.floor((user.xp / nextLevelXPThreshold) * 100));
        document.getElementById('user-dash-xp-progress').style.width = `${progressPercent}%`;
        document.getElementById('user-dash-xp-txt').textContent = `${user.xp} / ${nextLevelXPThreshold} XP to next tier`;

        // Scores matching user
        const allScores = DB.getScores();
        const userScores = allScores.filter(s => s.username.toLowerCase() === user.username.toLowerCase());
        
        // Personal High Score
        const highScore = userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0;
        document.getElementById('user-dash-highscore').textContent = highScore.toLocaleString();
        
        // Personal runs
        document.getElementById('user-dash-runs').textContent = userScores.length;

        // Render Recent Drills logs table
        const tableBody = document.getElementById('user-drill-history');
        tableBody.innerHTML = '';
        
        if (userScores.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" class="text-center" style="color: var(--text-muted);">No drills logs recorded yet. Proceed to training!</td></tr>`;
        } else {
            userScores.slice(0, 5).forEach(s => {
                // Random accuracy simulator
                const acc = Math.min(100, 80 + (s.level * 2) - Math.floor(Math.random()*10));
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="badge-row ${s.gameMode === 'Grid Flash' ? 'badge-cyan' : 'badge-purple'}">${s.gameMode}</span></td>
                    <td>${acc}%</td>
                    <td class="neon-glow">${s.score.toLocaleString()}</td>
                    <td>${s.date}</td>
                `;
                tableBody.appendChild(tr);
            });
        }

        // Render intensity progress bar chart (last 7 runs scores)
        const chartContainer = document.getElementById('user-progress-chart');
        chartContainer.innerHTML = '';
        
        const chartScores = userScores.slice(0, 7).reverse();
        if (chartScores.length === 0) {
            chartContainer.innerHTML = `<span style="color: var(--text-muted); margin: auto;">Play drills to generate stats logs</span>`;
        } else {
            const maxVal = Math.max(...chartScores.map(s => s.score));
            chartScores.forEach((s, i) => {
                const barWrapper = document.createElement('div');
                barWrapper.classList.add('chart-bar-wrapper');
                
                const heightPercent = maxVal > 0 ? (s.score / maxVal) * 80 + 10 : 10;
                
                barWrapper.innerHTML = `
                    <div class="chart-bar" style="height: ${heightPercent}%;" data-val="${(s.score/1000).toFixed(1)}k"></div>
                    <span class="chart-label">Run ${i + 1}</span>
                `;
                chartContainer.appendChild(barWrapper);
            });
        }
    }

    // --- ADMIN SYSTEM TERMINAL CONTROLLER ---
    const adminConfigForm = document.getElementById('admin-config-form');
    const rangeInput = document.getElementById('config-difficulty-scale');
    const rangeVal = document.getElementById('range-display-val');

    // Sync input range slider text display
    rangeInput.addEventListener('input', () => {
        rangeVal.textContent = `${rangeInput.value}x`;
    });

    function renderAdminDashboard() {
        const users = DB.getUsers();
        const scores = DB.getScores();
        const config = DB.getConfig();

        // Render stats indicators
        document.getElementById('admin-dash-users-count').textContent = users.length;
        document.getElementById('admin-dash-difficulty').textContent = `${config.difficultyScale}x`;

        // Sync inputs from DB
        document.getElementById('config-flash-time').value = config.flashDuration;
        document.getElementById('config-grid-size').value = config.gridSize;
        rangeInput.value = config.difficultyScale;
        rangeVal.textContent = `${config.difficultyScale}x`;

        // Render Users list table
        const adminUserList = document.getElementById('admin-user-list');
        adminUserList.innerHTML = '';

        users.forEach(u => {
            // Find max score for this user
            const userScores = scores.filter(s => s.username.toLowerCase() === u.username.toLowerCase());
            const maxScore = userScores.length > 0 ? Math.max(...userScores.map(s => s.score)) : 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${u.username}</td>
                <td>${u.email}</td>
                <td class="neon-glow">${maxScore.toLocaleString()}</td>
                <td><span class="badge-row ${u.role === 'admin' ? 'badge-purple' : 'badge-cyan'}">${u.role.toUpperCase()}</span></td>
                <td>
                    ${u.role !== 'admin' ? `
                        <button class="btn btn-mini btn-cyan reset-user-score" data-user="${u.username}">Reset</button>
                        <button class="btn btn-mini btn-purple delete-user" data-id="${u.id}">Delete</button>
                    ` : `<span style="color:var(--text-muted); font-size:0.8rem">SYSTEM CORE</span>`}
                </td>
            `;
            adminUserList.appendChild(tr);
        });

        // Attach listeners dynamically
        document.querySelectorAll('.reset-user-score').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetUser = btn.getAttribute('data-user');
                if (confirm(`Reset all score metrics for user: ${targetUser}?`)) {
                    playSound('click');
                    let allScores = DB.getScores();
                    allScores = allScores.filter(s => s.username.toLowerCase() !== targetUser.toLowerCase());
                    localStorage.setItem(DB_KEYS.SCORES, JSON.stringify(allScores));
                    renderAdminDashboard();
                }
            });
        });

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = btn.getAttribute('data-id');
                if (confirm("Are you sure you want to delete this athlete profile from MANSA registers?")) {
                    playSound('click');
                    let usersList = DB.getUsers();
                    usersList = usersList.filter(u => u.id !== targetId);
                    DB.saveUsers(usersList);
                    renderAdminDashboard();
                }
            });
        });
    }

    // Submit Configurations
    adminConfigForm.addEventListener('submit', (e) => {
        e.preventDefault();
        playSound('success');

        const cfg = {
            flashDuration: parseInt(document.getElementById('config-flash-time').value),
            gridSize: parseInt(document.getElementById('config-grid-size').value),
            difficultyScale: parseFloat(rangeInput.value)
        };

        DB.saveConfig(cfg);
        buildBoardGrid(); // rebuild game layout
        renderAdminDashboard(); // update numbers in dashboard
        
        alert("Cognitive chamber settings updated successfully.");
    });

    // Reset Database parameters
    document.getElementById('admin-reset-system-btn').addEventListener('click', () => {
        if (confirm("WARNING: This will wipe out all custom user signups, logs, scores, and restore default configurations. Proceed?")) {
            playSound('gameover');
            localStorage.clear();
            initDatabase();
            renderAdminDashboard();
            updateUserWidgets();
            navigateToSection('home');
            alert("Database re-initialized to standard templates.");
        }
    });

    // Initial triggers
    const initialUser = DB.getCurrentUser();
    if (initialUser) {
        if (initialUser.role === 'admin') {
            renderAdminDashboard();
        } else {
            renderUserDashboard();
        }
    }

});
