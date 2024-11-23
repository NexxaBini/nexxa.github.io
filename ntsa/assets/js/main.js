// 마우스 그라데이션 효과
document.addEventListener('mousemove', (e) => {
    const mouseGradient = document.querySelector('.mouse-gradient');
    const x = e.clientX / window.innerWidth * 100;
    const y = e.clientY / window.innerHeight * 100;
    mouseGradient.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(255, 0, 0, 0.08), transparent 50%)`;
});

// 텍스트 변경 애니메이션
const phrases = [
    "Discord Intelligence for Secure Environment",
    "Detecting Malicious Activities",
    "Preventing Security Threats",
    "Monitoring Suspicious Behavior",
    "Protecting Community Safety"
];

let currentIndex = 0;
const changingText = document.getElementById('changing-text');

function updateText() {
    changingText.style.opacity = '0';
    changingText.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % phrases.length;
        changingText.textContent = phrases[currentIndex];
        changingText.classList.add('text-transition');
        
        // Reset animation
        setTimeout(() => {
            changingText.classList.remove('text-transition');
        }, 800);
    }, 500);
}

// Initial text display
setTimeout(() => {
    changingText.classList.add('text-transition');
}, 500);

// Start text rotation
setInterval(updateText, 4000);

// 기존 샘플 데이터
const sampleUsers = [
    {
        tag: "User#1234",
        id: "123456789",
        joinDate: "2023-01-15",
        servers: 15,
        ip: "192.168.1.1",
        status: "주의 대상"
    },
    {
        tag: "User#5678",
        id: "987654321",
        joinDate: "2023-03-20",
        servers: 8,
        ip: "192.168.1.2",
        status: "위험"
    },
    {
        tag: "User#9012",
        id: "456789123",
        joinDate: "2023-06-10",
        servers: 23,
        ip: "192.168.1.3",
        status: "관찰 필요"
    }
];

// Function to create user card
function createUserCard(user) {
    return `
        <div class="user-card">
            <h3>${user.tag}</h3>
            <div class="user-info">ID: ${user.id}</div>
            <div class="user-info">가입일: ${user.joinDate}</div>
            <div class="user-info">서버: ${user.servers}개</div>
            <div class="user-info">IP: ${user.ip}</div>
            <div class="status">${user.status}</div>
        </div>
    `;
}

// Initialize user list
function initializeUserList() {
    const userList = document.getElementById('userList');
    if (userList) {
        userList.innerHTML = sampleUsers.map(user => createUserCard(user)).join('');
    }
}

// Search functionality
document.getElementById('searchBtn').addEventListener('click', () => {
    const searchInput = document.querySelector('input').value.toLowerCase();
    const filteredUsers = sampleUsers.filter(user => 
        user.tag.toLowerCase().includes(searchInput) || 
        user.id.includes(searchInput)
    );
    
    const userList = document.getElementById('userList');
    userList.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeUserList);
