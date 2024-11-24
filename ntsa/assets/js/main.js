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

const changingWords = [
    "Protect",
    "Secure",
    "Monitor",
    "Guard",
    "Shield"
];

let currentIndex = 0;
const changingSpan = document.getElementById('changing-word');
const changingSpanMobile = document.getElementById('changing-word-mobile');

function updateText() {
    // 페이드 아웃
    if (changingSpan) {
        changingSpan.style.opacity = '0';
        changingSpan.style.transform = 'translateY(10px)';
    }
    if (changingSpanMobile) {
        changingSpanMobile.style.opacity = '0';
        changingSpanMobile.style.transform = 'translateY(10px)';
    }
    
    setTimeout(() => {
        // 텍스트 변경
        currentIndex = (currentIndex + 1) % changingWords.length;
        const newWord = changingWords[currentIndex];
        
        if (changingSpan) {
            changingSpan.textContent = newWord;
        }
        if (changingSpanMobile) {
            changingSpanMobile.textContent = newWord;
        }
        
        // 페이드 인
        requestAnimationFrame(() => {
            if (changingSpan) {
                changingSpan.style.opacity = '1';
                changingSpan.style.transform = 'translateY(0)';
            }
            if (changingSpanMobile) {
                changingSpanMobile.style.opacity = '1';
                changingSpanMobile.style.transform = 'translateY(0)';
            }
        });
    }, 500);
}

// 초기 텍스트 설정
if (changingSpan) {
    changingSpan.textContent = changingWords[0];
}
if (changingSpanMobile) {
    changingSpanMobile.textContent = changingWords[0];
}

// 초기 페이드 인
setTimeout(() => {
    if (changingSpan) {
        changingSpan.style.opacity = '1';
        changingSpan.style.transform = 'translateY(0)';
    }
    if (changingSpanMobile) {
        changingSpanMobile.style.opacity = '1';
        changingSpanMobile.style.transform = 'translateY(0)';
    }
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

// 검색 입력창과 버튼 요소
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const userList = document.getElementById('userList');

// 검색 함수
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    // 검색어가 비어있는 경우
    if (!searchTerm) {
        displaySearchResults(sampleUsers);
        return;
    }

    // 검색 실행
    const filteredUsers = sampleUsers.filter(user => 
        user.tag.toLowerCase().includes(searchTerm) || 
        user.id.includes(searchTerm) ||
        user.ip.includes(searchTerm)
    );

    displaySearchResults(filteredUsers);
}

// 검색 결과 표시 함수
function displaySearchResults(users) {
    // 결과가 없는 경우
    if (users.length === 0) {
        userList.innerHTML = `
            <div class="no-results">
                <p>검색 결과가 없습니다.</p>
            </div>
        `;
        return;
    }

    // 결과 표시
    userList.innerHTML = users.map(user => `
        <div class="user-card" data-user-id="${user.id}">
            <h3>${user.tag}</h3>
            <div class="user-info">ID: ${user.id}</div>
            <div class="user-info">가입일: ${user.joinDate}</div>
            <div class="user-info">서버: ${user.servers}개</div>
            <div class="user-info">IP: ${user.ip}</div>
            <div class="user-info">마지막 활동: ${user.lastActive}</div>
            <div class="status">${user.status}</div>
        </div>
    `).join('');

    // 검색 결과 애니메이션
    const cards = userList.querySelectorAll('.user-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, index * 100); // 카드별로 시차를 두어 순차적으로 나타나게 함
    });
}

// 검색 버튼 클릭 이벤트
searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    performSearch();
});

// 엔터 키 이벤트
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        performSearch();
    }
});

// 입력 중 실시간 검색 (디바운스 적용)
let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(performSearch, 300);
});

// 검색창 포커스 효과
searchInput.addEventListener('focus', () => {
    searchInput.parentElement.classList.add('search-focused');
});

searchInput.addEventListener('blur', () => {
    searchInput.parentElement.classList.remove('search-focused');
});

// 초기 데이터 로드
document.addEventListener('DOMContentLoaded', () => {
    displaySearchResults(sampleUsers);
});

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
