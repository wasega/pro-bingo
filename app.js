// 1. Supabase Initialization (ቁልፎችህን እዚህ ቦታ ላይ ተካ)
const SUPABASE_URL = "https://eritlinwsctlbmqhbyju.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVyaXRsaW53c2N0bGJtcWhieWp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkzMTM5OTYsImV4cCI6MjEwNDg4OTk5Nn0.lLfbYZBEe6T0qry3xFJiWQGUxydd79LzfrMe8tc2ieo";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Telegram Web App Initialization
const tg = window.Telegram ? window.Telegram.WebApp : null;
let currentUser = null;

if (tg) {
    tg.expand();
    currentUser = tg.initDataUnsafe.user;
}

// አፑ ሲከፈት ተጠቃሚውን መመዝገብ እና ዳታውን መጫን
document.addEventListener('DOMContentLoaded', async () => {
    if (currentUser) {
        document.getElementById('userName').innerHTML = `${currentUser.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
        document.getElementById('userAvatar').innerText = currentUser.first_name.charAt(0);
        
        // ተጠቃሚውን ዳታቤዝ ውስጥ መመዝገብ / ማረጋገጥ
        await syncUserWithDatabase(currentUser);
    }
});

// ተጠቃሚውን በ Supabase ውስጥ የመመዝገብ እና Balance የማንበብ Logic
async function syncUserWithDatabase(user) {
    try {
        // ተጠቃሚው መኖሩን ማረጋገጥ
        let { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('telegram_id', user.id)
            .single();

        if (!data) {
            // አዲስ ተጠቃሚ ከሆነ መመዝገብ
            const { data: newUser, error: insertError } = await supabase
                .from('users')
                .insert([
                    { 
                        telegram_id: user.id, 
                        first_name: user.first_name, 
                        username: user.username || '' 
                    }
                ])
                .select()
                .single();
            
            data = newUser;
        }

        // የቦታውን Wallet Balance ማሳየት
        if (data) {
            const formattedBalance = parseFloat(data.balance).toFixed(2) + " ETB";
            document.getElementById('userBalance').innerText = formattedBalance;
            if(document.getElementById('profileBalance')) {
                document.getElementById('profileBalance').innerText = formattedBalance;
            }
        }
    } catch (err) {
        console.error("Database connection error:", err);
    }
}

// 3. Deposit Request መላኪያ Function
async function submitDeposit() {
    const transId = document.getElementById('transId').value.trim();
    const amount = parseFloat(document.getElementById('depositAmount').value);

    if (!transId || !amount || amount <= 0) {
        alert("እባክዎ ትክክለኛ የትራንዛክሽን ቁጥር እና የብር መጠን ያስገቡ!");
        return;
    }

    if (!currentUser) {
        alert("የቴሌግራም መረጃዎን ማግኘት አልተቻለም!");
        return;
    }

    try {
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
            if (error.code === '23505') { // Unique constraint violation
                alert("ይህ የትራንዛክሽን ቁጥር ቀደም ብሎ ገብቷል!");
            } else {
                alert("ስህተት ተፈጥሯል፡ " + error.message);
            }
        } else {
            alert("የገቢ ጥያቄዎ በትክክል ተልኳል! አድሚኑ እንደተመለከተው አካውንትዎ ላይ ይጫናል።");
            document.getElementById('transId').value = '';
            document.getElementById('depositAmount').value = '';
        }
    } catch (err) {
        console.error("Deposit error:", err);
    }
}

// 4. Tab Switching Logic
function switchTab(tabId, element) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if (element) {
        element.classList.add('active');
    }
}

// 5. Open Bingo Game Room with 200 Numbers
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

// Close Bingo Modal
function closeBingoRoom() {
    document.getElementById('gameModal').style.display = 'none';
}
