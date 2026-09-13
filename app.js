// Telegram Web App Initialization
const tg = window.Telegram ? window.Telegram.WebApp : null;

if (tg) {
    tg.expand(); // ሚኒ አፑ በሙሉ ስክሪን እንዲከፈት
    // ከተጠቃሚው ቴሌግራም አካውንት መረጃዎችን መውሰድ
    const user = tg.initDataUnsafe.user;
    if (user) {
        document.getElementById('userName').innerText = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        document.getElementById('userAvatar').innerText = user.first_name.charAt(0);
    }
}

// ገጾችን በመጫን መቀያየር (Tab Switching)
function switchTab(tabId, element) {
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(content => content.classList.remove('active'));

    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => btn.classList.remove('active'));

    document.getElementById(tabId).classList.add('active');
    if(element) element.classList.add('active');
}

// ቢንጎ ክፍሉን መክፈቻ እና 100 ቁጥሮችን ሰሌዳው ላይ መፍጠሪያ
function openBingoRoom(stake = "10 ETB") {
    document.getElementById('gameModal').style.display = 'block';
    document.getElementById('selectedStake').innerText = stake;
    document.getElementById('stakeAmount').innerText = stake;

    const grid = document.getElementById('bingoGrid');
    grid.innerHTML = ''; // አሮጌውን ማጽጃ

    // ከ 1 እስከ 200 ቁጥሮችን በራስ-ሰር ሰሌዳው ላይ መፍጠር
    for (let i = 1; i <= 200; i++) {
        const box = document.createElement('div');
        box.className = 'number-box';
        box.innerText = i;
        
        // ቁጥር ሲጫኑ መምረጫ
        box.onclick = function() {
            this.classList.toggle('selected');
        };

        grid.appendChild(box);
    }
}

// የቢንጎ ክፍሉን መዝጊያ
function closeBingoRoom() {
    document.getElementById('gameModal').style.display = 'none';
}) {
