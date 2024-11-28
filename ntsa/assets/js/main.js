// 전역 변수 선언
let currentX = 70;
let currentY = 60;
let targetX = 70;
let targetY = 60;
let rafId = null;

// DOM 요소
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const userList = document.getElementById('userList');

// 샘플 데이터
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

// 네비게이션 바 관리
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

// 메뉴 하이라이트
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

// 모바일 메뉴 관리
// 모바일 메뉴 관리
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileCloseBtn = document.querySelector('.mobile-close-btn');
    const navLinks = document.querySelector('.nav-links');
    const allNavLinks = document.querySelectorAll('.nav-links a');

    function closeMenu() {
        navLinks.classList.remove('active');
    }

    function openMenu() {
        navLinks.classList.add('active');
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', openMenu);
    }

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMenu);
    }

    // 메뉴 항목 클릭 처리
    allNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // 메뉴 외부 클릭 처리
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            closeMenu();
        }
    });
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

// 텍스트 변경 애니메이션
    const changingWords = ["Protect", "Secure", "Monitor", "Guard", "Shield"];
    let currentIndex = 0;
    
    function updateText() {
        const elements = [
            document.getElementById('changing-word'),
            document.getElementById('changing-word-mobile')
        ].filter(Boolean);
        
        // 페이드 아웃
        elements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(10px)';
        });
        
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % changingWords.length;
            const newWord = changingWords[currentIndex];
            
            elements.forEach(element => {
                element.textContent = newWord;
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                });
            });
        }, 500);
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        // 초기 상태 설정
        handleNavbarScroll();
        handleMenuHighlight();
        initializeMobileMenu();
        displaySearchResults(sampleUsers);
    
        // 텍스트 초기화 및 애니메이션 시작
        const elements = [
            document.getElementById('changing-word'),
            document.getElementById('changing-word-mobile')
        ].filter(Boolean);
    
        elements.forEach(element => {
            if (element) {
                element.textContent = changingWords[0];
                // 초기 텍스트를 즉시 표시
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    
        // 이후 주기적으로 텍스트 업데이트
        setInterval(updateText, 5000);
    });
    // 검색 이벤트 리스너
    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        performSearch();
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    // 검색창 포커스 효과
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('search-focused');
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('search-focused');
    });

    // 디바운스된 실시간 검색
    let debounceTimer;
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });

// 스크롤 이벤트
window.addEventListener('scroll', () => {
    handleNavbarScroll();
    handleMenuHighlight();
});

// 마우스 이벤트
document.addEventListener('mousemove', handleMouseGradient);
