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
const resultsCount = document.querySelector('.results-count');

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

function initializeFilterModal() {
    const filterBtn = document.getElementById('filterBtn');
    const filterModal = document.getElementById('filterModal');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const modalContent = document.querySelector('.modal-content');
    const resetBtn = document.querySelector('.reset-btn');
    const applyBtn = document.querySelector('.apply-btn');

    function openModal() {
        filterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        filterModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    filterBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // 모달 외부 클릭 시 닫기
    filterModal.addEventListener('click', (e) => {
        if (e.target === filterModal) {
            closeModal();
        }
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && filterModal.classList.contains('active')) {
            closeModal();
        }
    });

    // 초기화 버튼
    resetBtn.addEventListener('click', () => {
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        const checkboxInputs = document.querySelectorAll('input[type="checkbox"]');
        const dateInputs = document.querySelectorAll('.date-input');

        radioInputs[0].checked = true; // 최신순 선택
        checkboxInputs.forEach(input => input.checked = true); // 모든 체크박스 선택
        dateInputs.forEach(input => input.value = ''); // 날짜 초기화
    });

    // 적용하기 버튼
    applyBtn.addEventListener('click', () => {
        closeModal();
        // 여기에 필터 적용 로직 추가 예정
    });
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

// 초기화 및 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 초기 상태 설정
    handleNavbarScroll();
    initializeMobileMenu();

    // 검색창 포커스 효과
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('search-focused');
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('search-focused');
    });
    
    initializeFilterModal();
    
});

// 스크롤 이벤트
window.addEventListener('scroll', handleNavbarScroll);

// 마우스 이벤트
document.addEventListener('mousemove', handleMouseGradient);
