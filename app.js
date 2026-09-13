// 1. Supabase Initialization (ቁልፎችህን እዚህ ተካ)
const SUPABASE_URL = "https://eritlinwsctlbmqhbyju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXRsaW53c2N0bGJtcWhieWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTM5OTYsImV4cCI6MjEwNDg4OTk5Nn0.lLfbYZBEe6T0qry3xFJiWQGUxydd79LzfrMe8tc2ieo";

let supabase = null;

// Supabase በትክክል መጫኑን ማረጋገጫ
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log("Supabase connected successfully!");
    } else {
        console.error("Supabase library loading failed.");
    }
} catch (e) {
    console.error("Supabase Init Error: ", e);
}

// 2. Telegram Web App Initialization
const tg = window.Telegram ? window.Telegram.WebApp : null;
let currentUser = {
    id: 12345678,
    first_name: "Test User",
    username: "testuser"
};

if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
    tg.expand();
    currentUser = tg.initDataUnsafe.user;
}

// ገጹ ሲከፈት
document.addEventListener('DOMContentLoaded', async () => {
    const userNameElem = document.getElementById('userName');
    const userAvatarElem = document.getElementById('userAvatar');
    
    if (userNameElem) userNameElem.innerHTML = `${currentUser.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
    if (userAvatarElem) userAvatarElem.innerText = currentUser.first_name.charAt(0);

    if (supabase) {
        await syncUserWithDatabase(currentUser);
    }
});

// User Sync Function
async function syncUserWithDatabase(user) {
    if (!supabase) return;
    try {
        let { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', user.id)
            .maybeSingle();

        if (!data) {
            const { data: newUser } = await supabase
                .from('users')
                .insert([
                    { 
                        telegram_id: user.id, 
                        first_name: user.first_name, 
                        username: user.username || '' 
                    }
                ])
                .select()
                .maybeSingle();
            
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
        console.error("Database connection error:", err);
    }
}

// 3. Deposit Request Function
async function submitDeposit() {
    const transIdElem = document.getElementById('transId');
    const amountElem = document.getElementById('depositAmount');

    const transId = transIdElem ? transIdElem.value.trim() : '';
    const amount = amountElem ? parseFloat(amountElem.value) : 0;

    if (!transId || !amount || amount <= 0) {
        alert("እባክዎ ትክክለኛ የትራንዛክሽን ቁጥር እና የብር መጠን ያስገቡ!");
        return;
    }

    if (!supabase) {
        alert("ከዳታቤዝ ጋር መገናኘት አልተቻለም! እባክዎ ኢንተርኔትዎን ወይም የ Supabase ቁልፎችን ያረጋግጡ።");
        return;
    }

    try {
        // ተጠቃሚው መኖሩን ማረጋገጥ
        await syncUserWithDatabase(currentUser);

        // Deposit ጥያቄ መላክ
        const { data, error } = await supabase
            .from('transactions')
            .insert([
                {
                    telegram_id: currentUser.id,
                    amount: amount,
                    trans_id: transId,
                    type: 'deposit',
                    status: 'pending'
                }
            ]);

        if (error) {
            alert("ስህተት፡ " + error.message);
        } else {
            alert("የገቢ ጥያቄዎ በትክክል ተልኳል!");
            if (transIdElem) transIdElem.value = '';
            if (amountElem) amountElem.value = '';
        }
    } catch (err) {
        alert("ያልተጠበቀ ስህተት፡ " + err.message);
    }
}

// 4. Tab Switcher Function (በማንኛውም ሁኔታ የሚሰራ)
function switchTab(tabId, element) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    const targetTab = document.getElementById(tabId);
    if (targetTab) targetTab.classList.add('active');
    if (element) element.classList.add('active');
}

// 5. Bingo Room Functions
function openBingoRoom(stake = "10 ETB", derash = 0) {
    document.getElementById('gameModal').style.display = 'block';
    document.getElementById('selectedStake').innerText = stake;
    document.getElementById('stakeAmount').innerText = stake;
    document.getElementById('derashAmount').innerText = derash + " ETB";

    const grid = document.getElementById('bingoGrid');
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

function closeBingoRoom() {
    document.getElementById('gameModal').style.display = 'none';
}
