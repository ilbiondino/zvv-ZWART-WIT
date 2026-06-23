// Player database from the PDF
const DEFAULT_PLAYERS = [
    { id: 1, name: 'Christ "Op 1 na de beste" van Beek', defaultRole: 'Speler' },
    { id: 2, name: 'Dave "ilbiondino" Jonker', defaultRole: 'Speler' },
    { id: 3, name: 'Frank "keeper" Kerstens', defaultRole: 'Keeper' },
    { id: 4, name: 'Hans van Gennip', defaultRole: 'Speler' },
    { id: 5, name: 'Huub Vissers', defaultRole: 'Speler' },
    { id: 6, name: 'Jan "Telly" Verwijmeren', defaultRole: 'Speler' },
    { id: 7, name: 'Jarno Fijneman', defaultRole: 'Speler' }, // Speler / Reserve Keeper in PDF
    { id: 8, name: 'Jos "De leste dan" Swenne', defaultRole: 'Speler' },
    { id: 9, name: 'Marinus "Nog eentje dan" Swenne', defaultRole: 'Speler' },
    { id: 10, name: 'Paul "Pol" van Gennip', defaultRole: 'Speler' },
    { id: 11, name: 'Peter "Peer" Pluijm', defaultRole: 'Keeper' },
    { id: 12, name: 'Raymond "Oudere Benjamin" van Beek', defaultRole: 'Speler' },
    { id: 13, name: 'Rien "Bijna de oudste" van Iersel', defaultRole: 'Speler' },
    { id: 14, name: 'Rob Simons', defaultRole: 'Speler' },
    { id: 15, name: 'Wim "Wimpie" Mertens', defaultRole: 'Speler' },
    { id: 16, name: 'Frank van Iersel', defaultRole: 'Keeper' }, // Reserve Keeper in PDF
    { id: 17, name: 'Patrick Broeders', defaultRole: 'Speler' } // Reserve Speler in PDF
];

// App State
let selectedIds = [];
let playerRoles = {}; // Map player ID to their custom role ('Speler' or 'Keeper')

// Audio Context for synthetic sounds
let audioCtx = null;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initPinLock();
    loadState();
    renderPlayerGrid();
    updateDashboard();
    setupEventListeners();
    initConfetti();
});

// Setup click handlers for general buttons
function setupEventListeners() {
    document.getElementById('btn-clear').addEventListener('click', clearSelection);
    document.getElementById('btn-default').addEventListener('click', resetToDefault);
    document.getElementById('btn-draw').addEventListener('click', startDrawSequence);
    document.getElementById('btn-theme').addEventListener('click', toggleTheme);
}

// Load state from localStorage or set defaults
function loadState() {
    const storedSelected = localStorage.getItem('zvv_selected_ids');
    const storedRoles = localStorage.getItem('zvv_player_roles');
    
    if (storedSelected && storedRoles) {
        selectedIds = JSON.parse(storedSelected);
        playerRoles = JSON.parse(storedRoles);
    } else {
        // Default: Select first 12 players including default keepers
        selectedIds = [];
        playerRoles = {};
        
        // Setup initial default roles
        DEFAULT_PLAYERS.forEach(p => {
            playerRoles[p.id] = p.defaultRole;
        });

        // Smart select: find 2 keepers and 10 field players
        let keepersSelected = 0;
        let playersSelected = 0;

        DEFAULT_PLAYERS.forEach(p => {
            if (p.defaultRole === 'Keeper' && keepersSelected < 2) {
                selectedIds.push(p.id);
                keepersSelected++;
            } else if (p.defaultRole === 'Speler' && playersSelected < 10) {
                selectedIds.push(p.id);
                playersSelected++;
            }
        });

        // In case we don't have enough, just select the first 12
        if (selectedIds.length < 12) {
            selectedIds = DEFAULT_PLAYERS.slice(0, 12).map(p => p.id);
        }
        
        saveState();
    }
}

// Save current state to localStorage
function saveState() {
    localStorage.setItem('zvv_selected_ids', JSON.stringify(selectedIds));
    localStorage.setItem('zvv_player_roles', JSON.stringify(playerRoles));
}

// Render the 17 players selection grid
function renderPlayerGrid() {
    const grid = document.getElementById('player-grid');
    grid.innerHTML = '';
    
    DEFAULT_PLAYERS.forEach(player => {
        const isSelected = selectedIds.includes(player.id);
        const currentRole = playerRoles[player.id] || player.defaultRole;
        
        const card = document.createElement('div');
        card.className = `player-select-card ${isSelected ? 'selected' : ''}`;
        card.dataset.id = player.id;
        
        card.innerHTML = `
            <div class="player-card-info">
                <div class="custom-checkbox"></div>
                <span class="player-name" title="${player.name}">${player.name}</span>
            </div>
            <span class="role-badge ${currentRole.toLowerCase()}" data-id="${player.id}">${currentRole}</span>
        `;
        
        // Add click listener to the card (toggles selection)
        card.addEventListener('click', (e) => {
            // Prevent selection toggle if user clicked on the role badge itself
            if (e.target.classList.contains('role-badge')) {
                return;
            }
            togglePlayerSelection(player.id, card);
        });
        
        // Add click listener to the role badge (toggles role)
        const badge = card.querySelector('.role-badge');
        badge.addEventListener('click', (e) => {
            e.stopPropagation();
            togglePlayerRole(player.id, badge);
        });
        
        grid.appendChild(card);
    });
}

// Toggle selection of a player
function togglePlayerSelection(id, cardElement) {
    playTickSound(600);
    const index = selectedIds.indexOf(id);
    if (index > -1) {
        selectedIds.splice(index, 1);
        cardElement.classList.remove('selected');
    } else {
        selectedIds.push(id);
        cardElement.classList.add('selected');
    }
    saveState();
    updateDashboard();
}

// Toggle a player's role between Speler & Keeper
function togglePlayerRole(id, badgeElement) {
    playTickSound(800);
    const currentRole = playerRoles[id];
    const newRole = currentRole === 'Keeper' ? 'Speler' : 'Keeper';
    
    playerRoles[id] = newRole;
    badgeElement.textContent = newRole;
    badgeElement.className = `role-badge ${newRole.toLowerCase()}`;
    
    saveState();
    updateDashboard();
}

// Clear all checkboxes
function clearSelection() {
    playTickSound(300);
    selectedIds = [];
    saveState();
    renderPlayerGrid();
    updateDashboard();
}

// Reset selections and roles to default values
function resetToDefault() {
    playTickSound(450);
    localStorage.removeItem('zvv_selected_ids');
    localStorage.removeItem('zvv_player_roles');
    loadState();
    renderPlayerGrid();
    updateDashboard();
}

// Calculate counts and update dashboard metrics & draw button state
function updateDashboard() {
    const countTotal = selectedIds.length;
    
    let countKeepers = 0;
    let countPlayers = 0;
    
    selectedIds.forEach(id => {
        const role = playerRoles[id] || 'Speler';
        if (role === 'Keeper') {
            countKeepers++;
        } else {
            countPlayers++;
        }
    });
    
    // Update labels
    document.getElementById('count-total').textContent = countTotal;
    document.getElementById('count-keepers').textContent = countKeepers;
    document.getElementById('count-players').textContent = countPlayers;
    
    // Update progress bars
    updateProgressBar('bar-total', countTotal, 12);
    updateProgressBar('bar-keepers', countKeepers, 2);
    updateProgressBar('bar-players', countPlayers, 10);
    
    // Update card styling based on validation
    updateCardStatus('card-total', countTotal === 12);
    updateCardStatus('card-keepers', countKeepers === 2, countKeepers > 2);
    updateCardStatus('card-players', countPlayers === 10, countPlayers > 10);
    
    // Enable/Disable Draw button
    const btnDraw = document.getElementById('btn-draw');
    const warning = document.getElementById('draw-warning');
    
    const isValid = (countTotal === 12 && countKeepers === 2 && countPlayers === 10);
    
    btnDraw.disabled = !isValid;
    if (isValid) {
        warning.classList.add('valid');
    } else {
        warning.classList.remove('valid');
        // Custom warning message based on what is missing
        let msg = "Selecteer exact 12 spelers (waarvan 2 keepers en 10 veldspelers) om te loten.";
        if (countTotal !== 12) {
            msg = `Kies exact 12 spelers (nu: ${countTotal}).`;
        } else if (countKeepers !== 2) {
            msg = `Je hebt exact 2 keepers nodig (nu: ${countKeepers}).`;
        } else if (countPlayers !== 10) {
            msg = `Je hebt exact 10 veldspelers nodig (nu: ${countPlayers}).`;
        }
        warning.textContent = msg;
    }
}

// Helper to update progress bars
function updateProgressBar(elementId, value, max) {
    const percent = Math.min((value / max) * 100, 100);
    const bar = document.getElementById(elementId);
    bar.style.width = `${percent}%`;
}

// Helper to add success/error states to dashboard status cards
function updateCardStatus(cardId, isSuccess, isError = false) {
    const card = document.getElementById(cardId);
    if (isSuccess) {
        card.classList.add('active');
        card.classList.remove('error');
    } else if (isError) {
        card.classList.remove('active');
        card.classList.add('error');
    } else {
        card.classList.remove('active');
        card.classList.remove('error');
    }
}

// Sound effects using Web Audio API
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playTickSound(frequency = 440, duration = 0.05) {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Audio might fail due to user gesture requirements on some browsers
    }
}

function playChimeSound() {
    try {
        initAudio();
        if (!audioCtx) return;
        
        const now = audioCtx.currentTime;
        
        // Play a nice minor/major seventh chord for team announcement
        const freqs = [261.63, 329.63, 392.00, 523.25]; // C major chord
        
        freqs.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.frequency.setValueAtTime(freq, now + (index * 0.08));
            osc.type = 'triangle';
            
            gain.gain.setValueAtTime(0.0, now);
            gain.gain.linearRampToValueAtTime(0.1, now + (index * 0.08) + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
            
            osc.start(now + (index * 0.08));
            osc.stop(now + 1.5);
        });
    } catch (e) {
        // Ignored
    }
}

// Lottery Draw sequence with animation
function startDrawSequence() {
    const btnDraw = document.getElementById('btn-draw');
    const resultsPanel = document.getElementById('results-panel');
    const selectionCards = document.querySelectorAll('.player-select-card');
    
    btnDraw.disabled = true;
    resultsPanel.classList.add('hidden');
    
    // Add shake animation to the cards to build tension
    selectionCards.forEach(card => {
        if (card.classList.contains('selected')) {
            card.classList.add('shuffling-animation');
        }
    });

    // Tick tick sound intervals
    let ticks = 0;
    const maxTicks = 15;
    const tickInterval = setInterval(() => {
        playTickSound(400 + (ticks * 50), 0.04);
        ticks++;
        if (ticks >= maxTicks) {
            clearInterval(tickInterval);
        }
    }, 90);
    
    setTimeout(() => {
        // Remove shake animation
        selectionCards.forEach(card => {
            card.classList.remove('shuffling-animation');
        });
        
        // Perform the actual team division
        performDraw();
        
        // Show results
        resultsPanel.classList.remove('hidden');
        resultsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Re-enable draw button
        btnDraw.disabled = false;
        
        // Sound and Confetti!
        playChimeSound();
        triggerConfetti();
        
    }, 1500);
}

// Fisher-Yates Shuffle Algorithm
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Core drawing logic
function performDraw() {
    // 1. Separate selected players into Keepers and Field Players
    const selectedKeepers = [];
    const selectedFieldPlayers = [];
    
    selectedIds.forEach(id => {
        const player = DEFAULT_PLAYERS.find(p => p.id === id);
        const role = playerRoles[id] || player.defaultRole;
        
        const playerInfo = {
            id: player.id,
            name: player.name,
            role: role
        };
        
        if (role === 'Keeper') {
            selectedKeepers.push(playerInfo);
        } else {
            selectedFieldPlayers.push(playerInfo);
        }
    });
    
    // Double check constraints (already validated by UI, but safety first)
    if (selectedKeepers.length !== 2 || selectedFieldPlayers.length !== 10) {
        console.error("Invalid team constraints", selectedKeepers, selectedFieldPlayers);
        return;
    }
    
    // 2. Shuffle keepers
    const shuffledKeepers = shuffleArray(selectedKeepers);
    const keeperWhite = shuffledKeepers[0];
    const keeperBlack = shuffledKeepers[1];
    
    // 3. Shuffle field players
    const shuffledFieldPlayers = shuffleArray(selectedFieldPlayers);
    
    // Split into 5 for WIT and 5 for ZWART
    const playersWhite = shuffledFieldPlayers.slice(0, 5);
    const playersBlack = shuffledFieldPlayers.slice(5, 10);
    
    // 4. Randomly pick 1 reserve per team (starts on bench)
    const reserveWhiteIndex = Math.floor(Math.random() * 5);
    const reserveBlackIndex = Math.floor(Math.random() * 5);
    
    const benchWhite = playersWhite[reserveWhiteIndex];
    const startersWhite = playersWhite.filter((_, idx) => idx !== reserveWhiteIndex);
    
    const benchBlack = playersBlack[reserveBlackIndex];
    const startersBlack = playersBlack.filter((_, idx) => idx !== reserveBlackIndex);
    
    // 5. Render results to DOM
    renderTeamResults('white', keeperWhite, startersWhite, benchWhite, playersWhite, reserveWhiteIndex);
    renderTeamResults('black', keeperBlack, startersBlack, benchBlack, playersBlack, reserveBlackIndex);
}

// Render details of a drawn team (WIT or ZWART)
function renderTeamResults(teamColor, keeper, starters, bench, allFieldPlayers, benchIndex) {
    const prefix = `team-${teamColor}`;
    
    // Render keeper
    const keeperContainer = document.getElementById(`${prefix}-keeper`);
    keeperContainer.innerHTML = `
        <span class="player-card-name">${keeper.name}</span>
        <span class="player-card-role">KEEPER</span>
    `;
    
    // Render starters
    const startersContainer = document.getElementById(`${prefix}-starters`);
    startersContainer.innerHTML = '';
    starters.forEach(player => {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.innerHTML = `
            <span class="player-card-name">${player.name}</span>
            <span class="player-card-role">VELDSPELER</span>
        `;
        startersContainer.appendChild(card);
    });
    
    // Render bench
    const benchContainer = document.getElementById(`${prefix}-bench`);
    benchContainer.innerHTML = `
        <span class="player-card-name">${bench.name}</span>
        <span class="bench-badge">BANK</span>
    `;
    
    // Render Rotation Timeline
    // We generate a full cyclic rotation timeline using the field players
    // Order of rotation starting: starters [0, 1, 2, 3] and bench [4]
    // To make this robust, we create a list starting with starters then the bench
    const rotationList = [...starters, bench]; // bench is last
    const rotationContainer = document.getElementById(`${prefix}-rotation`);
    rotationContainer.innerHTML = '';
    
    // 5 steps of 5 mins, total 25 mins or 30 mins
    const steps = [
        { time: '00:00 - 05:00', text: 'Startopstelling. ' + bench.name.split(' "')[0] + ' begint op de bank.' },
        { time: '05:00 - 10:00', in: rotationList[4], out: rotationList[0] }, // Bench enters, Starter 0 goes to bench
        { time: '10:00 - 15:00', in: rotationList[0], out: rotationList[1] }, // Starter 0 enters, Starter 1 goes to bench
        { time: '15:00 - 20:00', in: rotationList[1], out: rotationList[2] }, // Starter 1 enters, Starter 2 goes to bench
        { time: '20:00 - 25:00', in: rotationList[2], out: rotationList[3] }, // Starter 2 enters, Starter 3 goes to bench
        { time: '25:00 - 30:00', in: rotationList[3], out: rotationList[4] }  // Starter 3 enters, bench player goes back to bench
    ];
    
    steps.forEach((step, idx) => {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'rotation-step';
        
        if (idx === 0) {
            stepDiv.innerHTML = `
                <span class="step-time">${step.time}</span>
                <span class="step-desc">${step.text}</span>
            `;
        } else {
            // Get short names to fit nicely
            const nameIn = step.in.name.split(' "')[0];
            const nameOut = step.out.name.split(' "')[0];
            
            stepDiv.innerHTML = `
                <span class="step-time">${step.time}</span>
                <span class="step-desc">
                    <span class="icon">➡️</span> <strong>${nameIn}</strong> in
                    <span class="icon out">⬅️</span> <strong>${nameOut}</strong> naar bank
                </span>
            `;
        }
        rotationContainer.appendChild(stepDiv);
    });
}

// Canvas Confetti Implementation
let confettiCanvas = null;
let confettiCtx = null;
let confettiActive = false;
let confettiParticles = [];
const colors = ['#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#3b82f6', '#ffffff'];

function initConfetti() {
    confettiCanvas = document.getElementById('confetti-canvas');
    confettiCtx = confettiCanvas.getContext('2d');
    
    // Resize handler
    window.addEventListener('resize', resizeConfettiCanvas);
    resizeConfettiCanvas();
}

function resizeConfettiCanvas() {
    if (confettiCanvas) {
        confettiCanvas.width = window.innerWidth;
        confettiCanvas.height = window.innerHeight;
    }
}

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = Math.random() * -100 - 20;
        this.size = Math.random() * 8 + 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.speedX = Math.random() * 4 - 2;
        this.speedY = Math.random() * 4 + 4;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
    }
    
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        
        // Add minor swaying movement
        this.speedX += Math.sin(this.y / 20) * 0.05;
    }
    
    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate((this.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = this.color;
        
        // Draw small rectangles or circles
        if (Math.random() > 0.5) {
            confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        } else {
            confettiCtx.beginPath();
            confettiCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            confettiCtx.fill();
        }
        
        confettiCtx.restore();
    }
}

function triggerConfetti() {
    confettiParticles = [];
    const count = 150;
    for (let i = 0; i < count; i++) {
        confettiParticles.push(new ConfettiParticle());
    }
    
    if (!confettiActive) {
        confettiActive = true;
        animateConfetti();
    }
}

function animateConfetti() {
    if (!confettiActive) return;
    
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    let activeParticles = false;
    
    confettiParticles.forEach(p => {
        p.update();
        p.draw();
        
        if (p.y < confettiCanvas.height) {
            activeParticles = true;
        }
    });
    
    if (activeParticles) {
        requestAnimationFrame(animateConfetti);
    } else {
        confettiActive = false;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

// Theme management functions
function initTheme() {
    const savedTheme = localStorage.getItem('zvv_theme') || 'dark';
    const themeIcon = document.getElementById('theme-icon');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    } else {
        document.body.classList.remove('light-theme');
        if (themeIcon) themeIcon.textContent = '🌙';
    }
}

function toggleTheme() {
    playTickSound(700);
    const isLight = document.body.classList.toggle('light-theme');
    const themeIcon = document.getElementById('theme-icon');
    if (isLight) {
        if (themeIcon) themeIcon.textContent = '☀️';
        localStorage.setItem('zvv_theme', 'light');
    } else {
        if (themeIcon) themeIcon.textContent = '🌙';
        localStorage.setItem('zvv_theme', 'dark');
    }
}

// PIN Protection State & Operations
const CORRECT_PIN = '061066';
let enteredPin = '';
let isPinLocked = true;
let isShaking = false;

function initPinLock() {
    const isAuth = sessionStorage.getItem('zvv_authenticated') === 'true';
    const pinScreen = document.getElementById('pin-screen');
    
    if (isAuth) {
        isPinLocked = false;
        if (pinScreen) {
            pinScreen.classList.add('hidden');
            pinScreen.style.display = 'none';
        }
    } else {
        isPinLocked = true;
        if (pinScreen) {
            pinScreen.classList.remove('hidden');
            pinScreen.style.display = 'flex';
        }
        setupPinEventListeners();
    }
}

function setupPinEventListeners() {
    const keys = document.querySelectorAll('.pin-key');
    keys.forEach(key => {
        key.addEventListener('click', () => {
            if (!isPinLocked || isShaking) return;
            const val = key.dataset.val;
            handlePinInput(val);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (!isPinLocked || isShaking) return;
        
        if (e.key >= '0' && e.key <= '9') {
            handlePinInput(e.key);
        } else if (e.key === 'Backspace') {
            handlePinInput('backspace');
        } else if (e.key === 'Escape' || e.key === 'Delete') {
            handlePinInput('clear');
        }
    });
}

function handlePinInput(val) {
    if (val === 'clear') {
        enteredPin = '';
        playTickSound(300, 0.05);
        updatePinDisplay();
    } else if (val === 'backspace') {
        if (enteredPin.length > 0) {
            enteredPin = enteredPin.slice(0, -1);
            playTickSound(400, 0.05);
            updatePinDisplay();
        }
    } else {
        if (enteredPin.length < 6) {
            enteredPin += val;
            playTickSound(450 + (enteredPin.length * 50), 0.05);
            updatePinDisplay();
            
            if (enteredPin.length === 6) {
                verifyPin();
            }
        }
    }
}

function updatePinDisplay() {
    const dots = document.querySelectorAll('#pin-dots .dot');
    dots.forEach((dot, idx) => {
        if (idx < enteredPin.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
        dot.classList.remove('error');
    });
    
    const msg = document.getElementById('pin-message');
    if (msg) {
        msg.textContent = 'Pincode vereist voor toegang';
        msg.classList.remove('error-text');
    }
}

function verifyPin() {
    if (enteredPin === CORRECT_PIN) {
        isPinLocked = false;
        sessionStorage.setItem('zvv_authenticated', 'true');
        playChimeSound();
        
        const msg = document.getElementById('pin-message');
        if (msg) {
            msg.textContent = 'Toegang verleend!';
            msg.style.color = 'var(--accent)';
        }
        
        const pinScreen = document.getElementById('pin-screen');
        if (pinScreen) {
            pinScreen.classList.add('hidden');
            setTimeout(() => {
                pinScreen.style.display = 'none';
            }, 400);
        }
    } else {
        isShaking = true;
        playTickSound(180, 0.25);
        
        const container = document.getElementById('pin-container');
        const dots = document.querySelectorAll('#pin-dots .dot');
        const msg = document.getElementById('pin-message');
        
        if (container) container.classList.add('shake');
        dots.forEach(dot => dot.classList.add('error'));
        if (msg) {
            msg.textContent = 'Onjuiste pincode, probeer opnieuw!';
            msg.classList.add('error-text');
        }
        
        setTimeout(() => {
            if (container) container.classList.remove('shake');
            enteredPin = '';
            updatePinDisplay();
            isShaking = false;
        }, 800);
    }
}

