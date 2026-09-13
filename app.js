// Telegram Web App Initialization
const tg = window.Telegram ? window.Telegram.WebApp : null;

if (tg) {
    tg.expand();
    const user = tg.initDataUnsafe.user;
    if (user) {
        document.getElementById('userName').innerHTML = `${user.first_name} <i class="fa-solid fa-gem vip-icon"></i>`;
        document.getElementById('userAvatar').innerText = user.first_name.charAt(0);
    }
}

// Tab Switcher
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

// Open Bingo Game Room with 200 Numbers
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
