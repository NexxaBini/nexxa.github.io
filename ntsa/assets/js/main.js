// 마우스 그라데이션 효과
document.addEventListener('mousemove', (e) => {
    const mouseGradient = document.querySelector('.mouse-gradient');
    // 기준점 (70%, 60%)에서 마우스 위치에 따라 ±5% 범위 내에서만 변화
    const baseX = 70;
    const baseY = 60;
    
    // 마우스 위치를 0~100 범위로 변환
    const mouseX = e.clientX / window.innerWidth * 100;
    const mouseY = e.clientY / window.innerHeight * 100;
    
    // 마우스 움직임의 영향을 10%로 줄임
    const x = baseX + (mouseX - baseX) * 0.1;
    const y = baseY + (mouseY - baseY) * 0.1;
    
    mouseGradient.style.background = `
        radial-gradient(
            circle at ${x}% ${y}%, 
            rgba(255, 0, 0, 0.12) 0%, 
            rgba(255, 0, 0, 0.08) 20%,
            rgba(255, 0, 0, 0.03) 40%,
            rgba(255, 0, 0, 0.01) 60%,
            transparent 80%
        )
    `;
});

const changingWords = [
    "Protect",
    "Secure",
    "Monitor",
    "Guard",
    "Shield"
];

let currentIndex = 0;
const changingSpan = document.getElementById('changing-word');

function updateText() {
    changingSpan.style.opacity = '0';
    changingSpan.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % changingWords.length;
        changingSpan.textContent = changingWords[currentIndex];
        changingSpan.classList.add('text-transition');
        
        // Reset animation
        setTimeout(() => {
            changingSpan.classList.remove('text-transition');
        }, 1000);
    }, 600);
}

// 초기 텍스트 표시
changingSpan.textContent = changingWords[0];
setTimeout(() => {
    changingSpan.classList.add('text-transition');
}, 100);

// 8초 간격으로 텍스트 변경
setInterval(updateText, 5000);

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

function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    const mouseGradient = document.querySelector('.mouse-gradient');
    mouseGradient.style.background = `
        radial-gradient(
            circle at ${currentX}% ${currentY}%, 
            rgba(255, 3, 40, 0.12) 0%, 
            rgba(255, 3, 40, 0.08) 20%,
            rgba(255, 3, 40, 0.03) 40%,
            rgba(255, 3, 40, 0.01) 60%,
            transparent 80%
        )
    `;

    rafId = requestAnimationFrame(animate);
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
