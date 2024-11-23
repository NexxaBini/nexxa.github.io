// 스크롤 기반 네비게이션 바 변경
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    const scrollPosition = window.scrollY;
    
    if (scrollPosition > 50) {
        navbar.classList.remove('navbar-initial');
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.add('navbar-initial');
        navbar.classList.remove('navbar-scrolled');
    }
}

// 스크롤 위치에 따른 메뉴 활성화
function handleMenuHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');
    
    const scrollPosition = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// 부드러운 스크롤
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// 모바일 메뉴 토글
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// 이벤트 리스너 등록
window.addEventListener('scroll', () => {
    handleNavbarScroll();
    handleMenuHighlight();
});

// 초기 상태 설정
document.addEventListener('DOMContentLoaded', () => {
    handleNavbarScroll();
    handleMenuHighlight();
});

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

// DOM 요소 참조
const heroSection = document.getElementById('hero');
const searchSection = document.getElementById('search');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResults = document.getElementById('searchResults');
const userList = document.getElementById('userList');
let debounceTimer; // 한 번만 선언
let isFirstSearch = true;
let currentIndex = 0;
let rafId;

// 변경될 단어들
const changingWords = [
    "Protect",
    "Secure",
    "Monitor",
    "Guard",
    "Shield"
];

// 마우스 그라데이션을 위한 변수
let currentX = 80;
let currentY = 60;
let targetX = 80;
let targetY = 60;

// 텍스트 변경 함수
function updateText() {
    const changingSpan = document.getElementById('changing-word');
    if (!changingSpan) return;

    changingSpan.style.opacity = '0';
    changingSpan.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        currentIndex = (currentIndex + 1) % changingWords.length;
        changingSpan.textContent = changingWords[currentIndex];
        
        requestAnimationFrame(() => {
            changingSpan.style.opacity = '1';
            changingSpan.style.transform = 'translateY(0)';
        });
    }, 500);
}

// 검색 기능
async function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (isFirstSearch) {
        // 애니메이션 중 스크롤 방지
        document.body.style.overflow = 'hidden';
        await animateFirstSearch();
        isFirstSearch = false;
    }

    const filteredUsers = searchTerm ? sampleUsers.filter(user => 
        user.tag.toLowerCase().includes(searchTerm) || 
        user.id.includes(searchTerm) ||
        user.ip.includes(searchTerm)
    ) : sampleUsers;

    displaySearchResults(filteredUsers);
}

// 첫 검색 애니메이션
async function animateFirstSearch() {
    // 히어로 섹션 페이드 아웃
    heroSection.classList.add('searching');
    
    // 약간의 지연 후 검색 섹션 이동
    await new Promise(resolve => setTimeout(resolve, 300));
    searchSection.classList.add('top-position');
    
    // 검색 결과 영역 표시
    await new Promise(resolve => setTimeout(resolve, 300));
    searchResults.classList.add('show');
    
    // 스크롤 방지 해제
    document.body.style.overflow = '';
}

// 검색 결과 표시
function displaySearchResults(users) {
    if (!userList) return;

    if (users.length === 0) {
        userList.innerHTML = `
            <div class="no-results">
                <p>검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }

    userList.innerHTML = users.map(user => `
        <div class="user-card">
            <h3>${user.tag}</h3>
            <div class="user-info">ID: ${user.id}</div>
            <div class="user-info">가입일: ${user.joinDate}</div>
            <div class="user-info">서버: ${user.servers}개</div>
            <div class="user-info">IP: ${user.ip}</div>
            <div class="user-info">마지막 활동: ${user.lastActive}</div>
            <div class="status">${user.status}</div>
        </div>
    `).join('');

    const cards = userList.querySelectorAll('.user-card');
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('show');
        }, 100 + (index * 100));
    });
}

// 마우스 그라데이션 애니메이션
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

// 이벤트 리스너들
document.addEventListener('DOMContentLoaded', () => {
    // 단어 변경 초기화
    const changingSpan = document.getElementById('changing-word');
    if (changingSpan) {
        changingSpan.textContent = changingWords[0];
        setTimeout(() => {
            changingSpan.style.opacity = '1';
            changingSpan.style.transform = 'translateY(0)';
        }, 100);
    }

    // 검색 이벤트 초기화
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
    }

    if (searchInput) {
        // 엔터 키 검색
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });

        // 실시간 검색 (첫 검색 후)
        searchInput.addEventListener('input', () => {
            if (!isFirstSearch) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(performSearch, 300);
            }
        });

        // 검색창 포커스 효과
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.classList.add('search-focused');
        });

        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.classList.remove('search-focused');
        });
    }

    // 네비게이션 초기화
    handleNavbarScroll();
    handleMenuHighlight();

    // 초기 검색 결과 표시
    displaySearchResults(sampleUsers);
});

// 스크롤 이벤트
window.addEventListener('scroll', () => {
    handleNavbarScroll();
    handleMenuHighlight();
});

// 마우스 이벤트
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth * 100;
    const mouseY = e.clientY / window.innerHeight * 100;
    
    targetX = 80 + (mouseX - 80) * 0.03;
    targetY = 60 + (mouseY - 60) * 0.03;

    if (!rafId) {
        animate();
    }
});

// 워드 체인저 시작
setInterval(updateText, 5000);

// 기존 샘플 데이터
const sampleUsers = [
    {
        tag: "User#1234",
        id: "123456789",
        joinDate: "2023-01-15",
        servers: 15,
        ip: "192.168.1.1",
        status: "주의 대상",
        lastActive: "2024-03-15"
    },
    {
        tag: "User#5678",
        id: "987654321",
        joinDate: "2023-03-20",
        servers: 8,
        ip: "192.168.1.2",
        status: "위험",
        lastActive: "2024-03-20"
    },
    {
        tag: "User#9012",
        id: "456789123",
        joinDate: "2023-06-10",
        servers: 23,
        ip: "192.168.1.3",
        status: "관찰 필요",
        lastActive: "2024-03-18"
    }
];
