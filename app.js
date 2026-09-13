// 1. Supabase Initialization (ስህተት ቢፈጠር እንኳ አፑ እንዳይቆም ያደርጋል)
const SUPABASE_URL = "https://eritlinwsctlbmqhbyju.supabase.co"; // መጨረሻ ላይ / እንዳይኖር!
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXRsaW53c2N0bGJtcWhieWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTM5OTYsImV4cCI6MjEwNDg4OTk5Nn0.lLfbYZBEe6T0qry3xFJiWQGUxydd79LzfrMe8tc2ieo";

let supabase = null;

function initSupabase() {
    try {
        if (window.supabase && typeof window.supabase.createClient === 'function') {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase connected successfully!");
        } else if (window.supabaseJs && typeof window.supabaseJs.createClient === 'function') {
            supabase = window.supabaseJs.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase connected via supabaseJs!");
        } else {
            console.error("Supabase library not loaded properly.");
        }
    } catch (e) {
        console.error("Supabase Init Error:", e);
    }
}

// 2. Telegram Web App setup
const tg = window.Telegram ? window.Telegram.WebApp : null;
let currentUser = { id: 12345678, first_name: "Test User", username: "testuser" };

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    tg.expand();
    currentUser = tg.initDataUnsafe.user;
}

// ገጹ ሲከፈት
document.addEventListener('DOMContentLoaded', async () => {
    initSupabase(); // Supabase ን መክፈት
    
    const userNameElem = document.getElementById('userName');
    const userAvatarElem = document.getElementById('userAvatar');
    
    if (userNameElem) userNameElem.innerHTML = `${currentUser.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
    if (userAvatarElem) userAvatarElem.innerText = currentUser.first_name ? currentUser.first_name.charAt(0) : 'U';

    if (supabase) {
        await syncUserWithDatabase(currentUser);
    }
});

// Database Sync
async function syncUserWithDatabase(user) {
    if (!supabase) return;
    try {
        let { data, error } = await supabase.from('users').select('*').eq('telegram_id', user.id).maybeSingle();

        if (error) {
            console.error("User fetch error:", error);
            return;
        }

        if (!data) {
            const { data: newUser } = await supabase.from('users').insert([
                { telegram_id: user.id, first_name: user.first_name, username: user.username || '' }
            ]).select().maybeSingle();
            data = newUser;
        }

        if (data) {
            const formattedBalance = parseFloat(data.balance || 0).toFixed(2) + " ETB";
            const userBal = document.getElementById('userBalance');
            const profBal = document.getElementById('profileBalance');
            if (userBal) userBal.innerText = formattedBalance;
            if (profBal) profBal.innerText = formattedBalance;
        }
    } catch (err) {
        console.error("Sync Catch Error:", err);
    }
}

// 3. Deposit Request Submittion
async function submitDeposit() {
    const transIdElem = document.getElementById('transId');
    const amountElem = document.getElementById('depositAmount');

    const transId = transIdElem ? transIdElem.value.trim() : '';
    const amount = amountElem ? parseFloat(amountElem.value) : 0;

    if (!transId || isNaN(amount) || amount <= 0) {
        alert("እባክዎ ትክክለኛ የትራንዛክሽን ቁጥር እና የብር መጠን ያስገቡ!");
        return;
    }

    if (!supabase) {
        alert("ከዳታቤዝ ጋር መገናኘት አልተቻለም። እባክዎ የ Supabase ቁልፎችን ያረጋግጡ።");
        return;
    }

    try {
        const { data, error } = await supabase.from('transactions').insert([
            {
                telegram_id: currentUser.id,
                amount: amount,
                trans_id: transId,
                type: 'deposit',
                status: 'pending'
            }
        ]);

        if (error) {
            if (error.code === '23505') {
                alert("ይህ የትራንዛክሽን ቁጥር ቀደም ብሎ ገብቷል!");
            } else {
                alert("ስህተት፦ " + error.message);
            }
        } else {
            alert("ጥያቄዎ በትክክል ተልኳል! አድሚኑ ያረጋግጥልዎታል።");
            if (transIdElem) transIdElem.value = '';
            if (amountElem) amountElem.value = '';
        }
    } catch (err) {
        alert("ስህተት፦ " + err.message);
    }
}

// 4. Tab Navigation
function switchTab(tabId, element) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (element) element.classList.add('active');
}

// 5. Bingo Modal Functions
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
