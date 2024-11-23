// 마우스 움직임 부드럽게 처리하기 위한 변수
let currentX = 80;
let currentY = 60;
let targetX = 80;
let targetY = 60;
let rafId = null;

// 부드러운 애니메이션 함수
function animate() {
    // 현재 위치를 목표 위치로 부드럽게 이동
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    const mouseGradient = document.querySelector('.mouse-gradient');
    mouseGradient.style.background = `
        radial-gradient(
            circle at ${currentX}% ${currentY}%, 
            rgba(255, 0, 0, 0.12) 0%, 
            rgba(255, 0, 0, 0.08) 20%,
            rgba(255, 0, 0, 0.03) 40%,
            rgba(255, 0, 0, 0.01) 60%,
            transparent 80%
        )
    `;

    rafId = requestAnimationFrame(animate);
}

// 마우스 이벤트 리스너
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth * 100;
    const mouseY = e.clientY / window.innerHeight * 100;
    
    // 기준점(80%, 60%)에서 마우스 위치에 따라 ±3% 범위 내에서만 변화
    targetX = 80 + (mouseX - 80) * 0.03;
    targetY = 60 + (mouseY - 60) * 0.03;

    // 애니메이션이 실행 중이 아니면 시작
    if (!rafId) {
        animate();
    }
});

const changingWords = [
    "Detecting",
    "Monitoring",
    "Analyzing",
    "Tracking",
    "Identifying"
];

let currentIndex = 0;
const changingSpan = document.getElementById('changing-word');

function updateText() {
    changingSpan.style.opacity = '0';
    changingSpan.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % changingWords.length;
        changingSpan.textContent = changingWords[currentIndex];
        requestAnimationFrame(() => {
            changingSpan.style.opacity = '1';
            changingSpan.style.transform = 'translateY(0)';
        });
    }, 600);
}

// 초기 텍스트 표시
changingSpan.textContent = changingWords[0];
setTimeout(() => {
    changingSpan.style.opacity = '1';
    changingSpan.style.transform = 'translateY(0)';
}, 100);

// 텍스트 변경 간격
setInterval(updateText, 8000);

// 페이지 벗어날 때 애니메이션 정리
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        cancelAnimationFrame(rafId);
        rafId = null;
    } else {
        if (!rafId) {
            animate();
        }
    }
});

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
