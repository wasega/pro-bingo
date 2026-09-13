// ==========================================
// 1. Database Configuration (Direct REST API)
// ==========================================
const SUPABASE_URL = "https://eritlinwsctlbmqhbyju.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXRsaW53c2N0bGJtcWhieWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTM5OTYsImV4cCI6MjEwNDg4OTk5Nn0.lLfbYZBEe6T0qry3xFJiWQGUxydd79LzfrMe8tc2ieo"; // የእርስዎን ANON KEY እዚህ ይተኩ

async function supabaseFetch(endpoint, options = {}) {
    const url = `${SUPABASE_URL}/rest/v1/${endpoint}`;
    const headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
        ...options.headers
    };

    try {
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (err) {
        console.error("Supabase API Request Error:", err);
        throw err;
    }
}

// ==========================================
// 2. Safe Telegram User Detection
// ==========================================
let currentUser = { id: 6110364693, first_name: "Player", username: "player" };

function loadTelegramUser() {
    try {
        if (window.Telegram && window.Telegram.WebApp) {
            const tg = window.Telegram.WebApp;
            tg.ready();
            tg.expand();

            if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
                currentUser = tg.initDataUnsafe.user;
                console.log("Real Telegram User Loaded:", currentUser);
            }
        }
    } catch (e) {
        console.error("Telegram WebApp Error:", e);
    }
}

// ገጹ ሲከፈት
document.addEventListener('DOMContentLoaded', async () => {
    loadTelegramUser();

    const userNameElem = document.getElementById('userName');
    const userAvatarElem = document.getElementById('userAvatar');
    
    if (userNameElem) userNameElem.innerHTML = `${currentUser.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
    if (userAvatarElem) userAvatarElem.innerText = currentUser.first_name ? currentUser.first_name.charAt(0) : 'U';

    await syncUserWithDatabase(currentUser);
});

// ==========================================
// 3. Database Sync Function
// ==========================================
async function syncUserWithDatabase(user) {
    if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_PROJECT_ID")) return;

    try {
        const existingUsers = await supabaseFetch(`users?telegram_id=eq.${user.id}`);
        let userData = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

        if (!userData) {
            const newUsers = await supabaseFetch('users', {
                method: 'POST',
                body: JSON.stringify({
                    telegram_id: user.id,
                    first_name: user.first_name,
                    username: user.username || ''
                })
            });
            if (newUsers && newUsers.length > 0) userData = newUsers[0];
        }

        if (userData) {
            const formattedBalance = parseFloat(userData.balance || 0).toFixed(2) + " ETB";
            const userBal = document.getElementById('userBalance');
            const profBal = document.getElementById('profileBalance');
            if (userBal) userBal.innerText = formattedBalance;
            if (profBal) profBal.innerText = formattedBalance;
        }
    } catch (err) {
        console.error("Sync user failed:", err);
    }
}

// ==========================================
// 4. Submit Deposit
// ==========================================
async function submitDeposit() {
    const transIdElem = document.getElementById('transId');
    const amountElem = document.getElementById('depositAmount');

    const transId = transIdElem ? transIdElem.value.trim() : '';
    const amount = amountElem ? parseFloat(amountElem.value) : 0;

    if (!transId || isNaN(amount) || amount <= 0) {
        alert("እባክዎ ትክክለኛ የትራንዛክሽን ቁጥር እና የብር መጠን ያስገቡ!");
        return;
    }

    try {
        await supabaseFetch('transactions', {
            method: 'POST',
            body: JSON.stringify({
                telegram_id: currentUser.id,
                amount: amount,
                trans_id: transId,
                type: 'deposit',
                status: 'pending'
            })
        });

        alert("ጥያቄዎ በትክክል ተልኳል! አድሚኑ ያረጋግጥልዎታል።");
        if (transIdElem) transIdElem.value = '';
        if (amountElem) amountElem.value = '';

    } catch (err) {
        if (err.message && err.message.includes('409')) {
            alert("ይህ የትራንዛክሽን ቁጥር ቀደም ብሎ ገብቷል!");
        } else {
            alert("ጥያቄውን መላክ አልተቻለም፦ " + err.message);
        }
    }
}

// ==========================================
// 5. Navigation Tab Switcher
// ==========================================
function switchTab(tabId, element) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => {
        content.classList.remove('active');
        content.style.display = 'none';
    });

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = 'block';
    }

    if (element) {
        element.classList.add('active');
    }
}

// ==========================================
// 6. BINGO LIVE GAME ENGINE
// ==========================================
let currentGameState = {
    gameId: "DBAP1Q6F",
    calledNumbers: [],
    currentBall: null,
    pot: 0,
    players: 0,
    stake: 10
};

function render75Board() {
    const grid = document.getElementById('board75Grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 1; i <= 75; i++) {
        const cell = document.createElement('div');
        cell.id = `ball-${i}`;
        cell.innerText = i;
        cell.style.cssText = "background:#2a244d; border-radius:4px; padding:6px 0; font-size:11px; font-weight:bold; text-align:center; color:#aaa;";
        grid.appendChild(cell);
    }
}

function callNextNumber(num) {
    if (!num || currentGameState.calledNumbers.includes(num)) return;

    currentGameState.calledNumbers.push(num);
    currentGameState.currentBall = num;

    let letter = '';
    if (num <= 15) letter = 'B';
    else if (num <= 30) letter = 'I';
    else if (num <= 45) letter = 'N';
    else if (num <= 60) letter = 'G';
    else letter = 'O';

    const formattedBall = `${letter}-${num}`;

    const ballElem = document.getElementById('currentBallDisplay');
    if (ballElem) ballElem.innerText = formattedBall;

    const cell = document.getElementById(`ball-${num}`);
    if (cell) {
        cell.style.background = "#10b981";
        cell.style.color = "#fff";
    }

    const countElem = document.getElementById('calledCount');
    if (countElem) countElem.innerText = currentGameState.calledNumbers.length;
}

function startBingoGameView() {
    const gameScreen = document.getElementById('bingoGameScreen');
    if (gameScreen) gameScreen.style.display = 'block';

    render75Board();

    const interval = setInterval(() => {
        if (currentGameState.calledNumbers.length >= 75) {
            clearInterval(interval);
            return;
        }
        let randomNum = Math.floor(Math.random() * 75) + 1;
        while(currentGameState.calledNumbers.includes(randomNum)) {
            randomNum = Math.floor(Math.random() * 75) + 1;
        }
        callNextNumber(randomNum);
    }, 3000);
}

function openBingoRoom(stake = "10 ETB", derash = 0) {
    startBingoGameView();
}

function leaveGame() {
    const gameScreen = document.getElementById('bingoGameScreen');
    if (gameScreen) gameScreen.style.display = 'none';
}

function refreshGame() {
    location.reload();
}

// ==========================================
// 7. BINGO LIVE GAME ENGINE (አዲስ የሚጨመር)
// ==========================================
let currentUser = { id: 0, first_name: "Player" };
let currentGameState = {
    gameId: "DBAP1Q6F",
    calledNumbers: [],
    currentBall: null
};

// 1. TELEGRAM WEBAPP INIT
document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            currentUser = tg.initDataUnsafe.user;
        }
    }
    
    const userNameElem = document.getElementById('userName');
    if (userNameElem) userNameElem.innerText = currentUser.first_name;
});

// 2. TAB SWITCHER (FOR BOT AND TOUCH DEVICES)
function switchTab(tabId, btnElement) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (btnElement) btnElement.classList.add('active');
}

// 3. 75 BOARD GENERATOR (NO AUTO SELECT)
function render75Board() {
    const grid = document.getElementById('board75Grid');
    if (!grid) return;
    grid.innerHTML = '';

    for (let i = 1; i <= 75; i++) {
        const cell = document.createElement('div');
        cell.id = `ball-${i}`;
        cell.className = 'board-cell';
        cell.innerText = i;
        grid.appendChild(cell);
    }
}

// 4. OPEN GAME MODAL IN FULLSCREEN OVERLAY
function openBingoRoom(gameId = "DBAP1Q6F", stake = 10) {
    document.getElementById('gameIdDisplay').innerText = gameId;
    document.getElementById('stakeDisplay').innerText = stake;
    
    // ቦርዱን ማዘጋጀት
    render75Board();
    
    // ጌሙን ሙሉ ስክሪን ማድረግ
    const gameScreen = document.getElementById('bingoGameScreen');
    if (gameScreen) gameScreen.style.display = 'block';
}

// 5. MANUAL NUMBER CALLER (ለሙከራ ወይም ለሰርቨር ማዛመጃ)
function callNextNumber(num) {
    if (!num || currentGameState.calledNumbers.includes(num)) return;

    currentGameState.calledNumbers.push(num);
    currentGameState.currentBall = num;

    let letter = 'B';
    if (num > 15 && num <= 30) letter = 'I';
    else if (num > 30 && num <= 45) letter = 'N';
    else if (num > 45 && num <= 60) letter = 'G';
    else if (num > 60) letter = 'O';

    const ballDisplay = document.getElementById('currentBallDisplay');
    if (ballDisplay) ballDisplay.innerText = `${letter}-${num}`;

    const cell = document.getElementById(`ball-${num}`);
    if (cell) cell.classList.add('called');

    const countElem = document.getElementById('calledCount');
    if (countElem) countElem.innerText = currentGameState.calledNumbers.length;
}

// 6. LEAVE & REFRESH
function leaveGame() {
    const gameScreen = document.getElementById('bingoGameScreen');
    if (gameScreen) gameScreen.style.display = 'none';
    currentGameState.calledNumbers = [];
}

function refreshGame() {
    location.reload();
}
