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

function openBingoRoom() {
    alert("የቢንጎ ጨዋታ ክፍሎች በቅርቡ ይከፈታሉ!");
}
