// 전역 변수 선언
let currentX = 70;
let currentY = 60;
let targetX = 70;
let targetY = 60;
let rafId = null;

// DOM 요소
const navLinks = document.querySelector('.nav-links');
const statNumbers = document.querySelectorAll('.stat-number');

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
        link.addEventListener('click', (e) => {
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

// 통계 숫자 애니메이션
function animateNumbers() {
    const statNumbers = document.querySelectorAll('.stat-number');
    if (!statNumbers.length) return; // About 페이지가 아니면 실행하지 않음
    
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 100;
        const duration = 2000;
        const stepTime = duration / 100;
        
        function updateNumber() {
            current += increment;
            if (current < target) {
                stat.textContent = Math.floor(current).toLocaleString() + '+';
                setTimeout(updateNumber, stepTime);
            } else {
                stat.textContent = target.toLocaleString() + '+';
            }
        }
        
        updateNumber();
    });
}

function initializeAboutCards() {
    const aboutCards = document.querySelectorAll('.about-card');
    if (!aboutCards.length) return; // About 페이지가 아니면 실행하지 않음
    
    aboutCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.background = `
                radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255, 3, 40, 0.1) 0%,
                    rgba(17, 17, 17, 0.7) 50%
                )
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.background = 'rgba(17, 17, 17, 0.7)';
        });
    });
}

// 요소가 화면에 보이는지 확인하는 함수
function isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// 스크롤 이벤트에 따른 애니메이션 실행
function handleAboutScroll() {
    const statsSection = document.querySelector('.stats-section');
    if (statsSection && isElementInViewport(statsSection)) {
        animateNumbers();
        window.removeEventListener('scroll', handleAboutScroll);
    }
}

// 초기화 및 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    handleNavbarScroll();
    initializeMobileMenu();
    
    // 통계 섹션이 이미 보이는 상태라면 바로 애니메이션 실행
    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        if (isElementInViewport(statsSection)) {
            animateNumbers();
        } else {
            window.addEventListener('scroll', handleAboutScroll);
        }
        initializeAboutCards();
    }
    
    // About 카드 hover 효과 개선
    const aboutCards = document.querySelectorAll('.about-card');
    aboutCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            card.style.background = `
                radial-gradient(
                    circle at ${x}px ${y}px,
                    rgba(255, 3, 40, 0.1) 0%,
                    rgba(17, 17, 17, 0.7) 50%
                )
            `;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.background = 'rgba(17, 17, 17, 0.7)';
        });
    });
});

// 스크롤 이벤트
window.addEventListener('scroll', handleNavbarScroll);

// 마우스 이벤트
document.addEventListener('mousemove', handleMouseGradient);
