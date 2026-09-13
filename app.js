// ==========================================
// 1. Supabase Safe Client Initialization
// ==========================================
const SUPABASE_URL = "https://eritlinwsctlbmqhbyju.supabase.co"; // የእርስዎን URL እዚህ ይተኩ (መጨረሻ ላይ / እንዳይኖር!)
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXRsaW53c2N0bGJtcWhieWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTM5OTYsImV4cCI6MjEwNDg4OTk5Nn0.lLfbYZBEe6T0qry3xFJiWQGUxydd79LzfrMe8tc2ieo";              // የእርስዎን ANON KEY እዚህ ይተኩ

let supabaseClient = null;

// CDN ሙሉ በሙሉ ተጭኖ እስኪያልቅ ጠብቆ Supabase ን የሚፈጥር ፈንክሽን
function getSupabase() {
    if (supabaseClient) return supabaseClient;

    try {
        // CDN በ ተለያዩ ስሞች ሊጭነው ስለሚችል ሁሉንም አማራጭ መፈተሽ
        const supabaseLib = window.supabase || window.Supabase;

        if (supabaseLib && typeof supabaseLib.createClient === 'function') {
            supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("Supabase Client successfully initialized!");
        } else {
            console.warn("Supabase library is not loaded yet.");
        }
    } catch (err) {
        console.error("Supabase init error:", err);
    }

    return supabaseClient;
}

// ==========================================
// 2. Telegram WebApp User Setup
// ==========================================
let currentUser = { id: 12345678, first_name: "Test User", username: "testuser" };

try {
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        if (window.Telegram.WebApp.initDataUnsafe && window.Telegram.WebApp.initDataUnsafe.user) {
            currentUser = window.Telegram.WebApp.initDataUnsafe.user;
        }
    }
} catch (e) {
    console.error("Telegram WebApp Error:", e);
}

// ==========================================
// 3. Page Load Event
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const userNameElem = document.getElementById('userName');
    const userAvatarElem = document.getElementById('userAvatar');
    
    if (userNameElem) userNameElem.innerHTML = `${currentUser.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
    if (userAvatarElem) userAvatarElem.innerText = currentUser.first_name ? currentUser.first_name.charAt(0) : 'U';

    // ከ 500ms በኋላ ዳታቤዝ ለመገናኘት መሞከር (CDN እስኪዘጋጅ)
    setTimeout(() => {
        syncUserWithDatabase(currentUser);
    }, 500);
});

// ==========================================
// 4. Database User Sync
// ==========================================
async function syncUserWithDatabase(user) {
    const db = getSupabase();
    if (!db) return;

    try {
        let { data, error } = await db.from('users').select('*').eq('telegram_id', user.id).maybeSingle();

        if (error) {
            console.error("User fetch error:", error);
            return;
        }

        if (!data) {
            const { data: newUser } = await db.from('users').insert([
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

// ==========================================
// 5. Deposit Submission Function (የገቢ ጥያቄ)
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

    const db = getSupabase();
    if (!db) {
        alert("ከዳታቤዝ ጋር መገናኘት አልተቻለም! እባክዎ የ Supabase URL እና KEY ማስተካከላቸውን ያረጋግጡ።");
        return;
    }

    try {
        const { data, error } = await db.from('transactions').insert([
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
        alert("ያልተጠበቀ ስህተት፦ " + err.message);
    }
}

// ==========================================
// 6. Navigation Tabs Switcher
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
// 7. Bingo Modal Functions
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
