// SafeView 페이지 전용 스크립트

// 전역 변수
let currentX = 70;
let currentY = 60;
let targetX = 70;
let targetY = 60;
let rafId = null;

// 서버 데이터 가져오기
async function fetchServerData() {
    try {
        // URL에서 서버 ID 가져오기
        const urlParams = new URLSearchParams(window.location.search);
        const serverId = urlParams.get('server');

        if (!serverId) {
            showError('Server ID not provided');
            return;
        }

        const serverView = document.getElementById('serverView');
        if (!serverView) {
            console.error('Server view element not found');
            return;
        }

        // 로딩 상태 표시
        serverView.innerHTML = `
            <div class="server-view">
                <div class="loading">
                    <div class="loading-spinner"></div>
                </div>
            </div>
        `;

        // API 호출
        const response = await fetch(`/api/servers/${serverId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch server data');
        }

        const data = await response.json();
        renderServerView(data);

    } catch (error) {
        showError(error.message);
    }
}

// 서버 뷰 렌더링
function renderServerView(data) {
    const serverView = document.getElementById('serverView');
    if (!serverView) return;

    const memberCards = data.members.map(member => `
        <div class="member-card">
            <div class="member-header">
                <div class="member-avatar">
                    ${member.avatar 
                        ? `<img src="${member.avatar}" alt="${member.username}">`
                        : `<img src="/api/placeholder/48/48" alt="Default Avatar">`
                    }
                </div>
                <div class="member-info">
                    <div class="member-name">${member.username}</div>
                    <div class="member-id">${member.id}</div>
                </div>
            </div>
            <div class="member-details">
                <div class="detail-item">
                    <span class="detail-label">Joined Server</span>
                    <span class="detail-value">${formatDate(member.join_date)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Roles</span>
                    <span class="detail-value">${member.roles.length}</span>
                </div>
            </div>
        </div>
    `).join('');

    serverView.innerHTML = `
        <div class="server-view">
            <div class="server-header">
                <h1 class="server-name">${data.server_name}</h1>
                <div class="server-stats">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    ${data.member_count} Members
                </div>
            </div>
            <div class="members-grid">
                ${memberCards}
            </div>
        </div>
    `;

    // 카드 애니메이션
    const cards = document.querySelectorAll('.member-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// 에러 메시지 표시
function showError(message) {
    const serverView = document.getElementById('serverView');
    if (!serverView) return;

    serverView.innerHTML = `
        <div class="server-view">
            <div class="error-message">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>${message}</p>
            </div>
        </div>
    `;
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

// 마우스 그라데이션 효과
function handleMouseGradient(e) {
    const mouseGradient = document.querySelector('.mouse-gradient');
    const baseX = 70;
    const baseY = 60;
    
    const mouseX = e.clientX / window.innerWidth * 100;
    const mouseY = e.clientY / window.innerHeight * 100;
    
    targetX = baseX + (mouseX - baseX) * 0.1;
    targetY = baseY + (mouseY - baseY) * 0.1;

    if (!rafId) {
        rafId = requestAnimationFrame(animate);
    }
}

function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    const mouseGradient = document.querySelector('.mouse-gradient');
    if (mouseGradient) {
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
    }

    rafId = requestAnimationFrame(animate);
}

// 모바일 메뉴 초기화
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks?.classList.add('active');
        });
    }

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', () => {
            navLinks?.classList.remove('active');
        });
    }

    // 메뉴 외부 클릭 처리
    document.addEventListener('click', (e) => {
        if (navLinks?.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuBtn?.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    fetchServerData();
});

document.addEventListener('mousemove', handleMouseGradient);

// 네비게이션 바 스크롤 처리
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.classList.remove('navbar-initial');
            navbar.classList.add('navbar-scrolled');
        } else {
            navbar.classList.add('navbar-initial');
            navbar.classList.remove('navbar-scrolled');
        }
    }
});
