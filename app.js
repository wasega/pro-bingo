// ==========================================
// 1. Database Configuration (Direct REST API)
// ==========================================
const SUPABASE_URL = "https://eritlinwsctlbmqhbyju.supabase.co"; // መጨረሻ ላይ / እንዳይኖር!
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXRsaW53c2N0bGJtcWhieWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTM5OTYsImV4cCI6MjEwNDg4OTk5Nn0.lLfbYZBEe6T0qry3xFJiWQGUxydd79LzfrMe8tc2ieo"; // የእርስዎን ANON KEY እዚህ ይተኩ

// Direct HTTP Request Helper (Safe API Call)
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
// 2. Telegram WebApp Setup (የተስተካከለ)
// ==========================================
const tg = window.Telegram ? window.Telegram.WebApp : null;
let currentUser = { id: 12345678, first_name: "Test User", username: "testuser" };

function initTelegramUser() {
    if (tg) {
        tg.ready();  // ቴሌግራም ዝግጁ መሆኑን ማረጋገጫ
        tg.expand(); // አፑን ሙሉ ስክሪን ማድረግ

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            currentUser = tg.initDataUnsafe.user;
            console.log("Real Telegram User Loaded:", currentUser);
        } else {
            console.warn("Telegram user data not found, using test user.");
        }
    }
}

// ገጹ ሲከፈት (Page Load)
document.addEventListener('DOMContentLoaded', async () => {
    // 1. መጀመሪያ የቴሌግራም ተጠቃሚ መረጃን ማውጣት
    initTelegramUser();

    // 2. በስክሪኑ ላይ የይዘት ስሞችን ማሳየት
    const userNameElem = document.getElementById('userName');
    const userAvatarElem = document.getElementById('userAvatar');
    
    if (userNameElem) userNameElem.innerHTML = `${currentUser.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
    if (userAvatarElem) userAvatarElem.innerText = currentUser.first_name ? currentUser.first_name.charAt(0) : 'U';

    // 3. ከዳታቤዝ ጋር ማያያዝ
    await syncUserWithDatabase(currentUser);
});

// ==========================================
// 3. Database Sync Function
// ==========================================
async function syncUserWithDatabase(user) {
    if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
        console.warn("Supabase credentials have not been configured yet.");
        return;
    }

    try {
        // 1. ተጠቃሚው መኖሩን መፈለግ
        const existingUsers = await supabaseFetch(`users?telegram_id=eq.${user.id}`);
        let userData = existingUsers && existingUsers.length > 0 ? existingUsers[0] : null;

        // 2. ከሌለ አዲስ ማስገባት
        if (!userData) {
            const newUsers = await supabaseFetch('users', {
                method: 'POST',
                body: JSON.stringify({
                    telegram_id: user.id,
                    first_name: user.first_name,
                    username: user.username || ''
                })
            });
            if (newUsers && newUsers.length > 0) {
                userData = newUsers[0];
            }
        }

        // 3. የሒሳብ መጠን (Balance) ማሳየት
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
// 4. Submit Deposit (የገቢ ጥያቄ መላኪያ)
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

    if (!SUPABASE_URL || SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
        alert("እባክዎ በ app.js ላይ የ Supabase URL እና Key በትክክል ያስገቡ!");
        return;
    }

    try {
        await syncUserWithDatabase(currentUser);

        // የትራንዛክሽን ጥያቄ ወደ ዳታቤዝ መላክ
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
// 5. Navigation Tab Switcher (የታችኛው ማውጫ)
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
// 6. Bingo Room Functions
// ==========================================
function openBingoRoom(stake = "10 ETB", derash = 0) {
    const modal = document.getElementById('gameModal');
    if (modal) modal.style.display = 'block';
    
    const stakeElem = document.getElementById('selectedStake');
    const stakeAmtElem = document.getElementById('stakeAmount');
    const derashElem = document.getElementById('derashAmount');
    
    if (stakeElem) stakeElem.innerText = stake;
    if (stakeAmtElem) stakeAmtElem.innerText = stake;
    if (derashElem) derashElem.innerText = derash + " ETB";

    const grid = document.getElementById('bingoGrid');
    if (grid) {
        grid.innerHTML = '';
        for (let i = 1; i <= 200; i++) {
            const box = document.createElement('div');
            box.className = 'number-box';
            box.innerText = i;
            box.onclick = function() {
                this.classList.toggle('selected');
            };
            grid.appendChild(box);
        }
    }
}

function closeBingoRoom() {
    const modal = document.getElementById('gameModal');
    if (modal) modal.style.display = 'none';
}
