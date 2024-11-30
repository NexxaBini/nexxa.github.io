// 전역 변수 선언
let currentX = 70;
let currentY = 60;
let targetX = 70;
let targetY = 60;
let rafId = null;

const searchState = {
    isSearching: false,
    results: [],
    filters: {
        sort: 'latest',
        startDate: null,
        endDate: null,
        types: ['official', 'server', 'personal']
    }
};

// DOM 요소
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const userList = document.getElementById('userList');
const resultsCount = document.querySelector('.results-count');

// 네비게이션 바 관리
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
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
        filterModal.style.display = 'flex';
        // 강제 리플로우
        filterModal.offsetHeight;
        filterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        filterModal.classList.remove('active');
        document.body.style.overflow = '';
        // 트랜지션이 끝난 후 display none 처리
        setTimeout(() => {
            if (!filterModal.classList.contains('active')) {
                filterModal.style.display = 'none';
            }
        }, 300); // 트랜지션 시간과 동일하게 설정
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

const searchState = {
    isSearching: false,
    results: [],
    filters: {
        sort: 'latest',
        startDate: null,
        endDate: null,
        types: ['official', 'server', 'personal']
    }
};

async function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.querySelector('.search-results');

    // URL 파라미터 체크
    const urlParams = new URLSearchParams(window.location.search);
    const searchWord = urlParams.get('word');
    if (searchWord) {
        searchInput.value = searchWord;
        await performSearch(searchWord);
    }

    // 검색 입력 이벤트
    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            // URL 업데이트
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('word', query);
            window.history.pushState({}, '', newUrl);

            await performSearch(query);
        } else if (query.length === 0) {
            resetSearch();
        }
    }, 500));
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initializeMouseGradient() {
    function handleMouseGradient(e) {
        const mouseGradient = document.querySelector('.mouse-gradient');
        if (!mouseGradient) return;

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

    document.addEventListener('mousemove', handleMouseGradient);
}

async function performSearch(query) {
    try {
        const searchContainer = document.querySelector('.search-container');
        const searchResults = document.querySelector('.search-results');

        if (!searchState.isSearching) {
            searchState.isSearching = true;
            searchContainer.classList.add('searching');
            searchResults.classList.add('visible');
        }

        // SheetsAPI를 사용하여 Reports 시트에서 데이터 검색
        const sheetsAPI = new SheetsAPI(API_KEY);
        const results = await sheetsAPI.getReportData();
        
        // 검색어로 필터링
        const filteredResults = filterResults(results, query);
        
        // 결과 렌더링
        renderSearchResults(filteredResults);

    } catch (error) {
        console.error('Search error:', error);
        showError('검색 중 오류가 발생했습니다.');
    }
}

function filterResults(results, query) {
    const queryLower = query.toLowerCase();
    const filteredUsers = {};

    Object.entries(results.users || {}).forEach(([userId, userData]) => {
        const username = (userData.target?.username || '').toLowerCase();
        const displayName = (userData.target?.display_name || '').toLowerCase();
        const id = userId.toLowerCase();

        if (username.includes(queryLower) || 
            displayName.includes(queryLower) || 
            id.includes(queryLower)) {
            filteredUsers[userId] = userData;
        }
    });

    return {
        ...results,
        users: filteredUsers
    };
}

function renderSearchResults(results) {
    const resultsGrid = document.querySelector('.results-grid');
    if (!resultsGrid) return;

    resultsGrid.innerHTML = '';

    Object.entries(results.users || {}).forEach(([userId, userData]) => {
        const card = createUserCard(userId, userData);
        resultsGrid.appendChild(card);
    });
}

function createUserCard(userId, userData) {
    const card = document.createElement('div');
    card.className = 'user-card';

    const target = userData.target || {};
    const report = userData.reporter || {};

    card.innerHTML = `
        <div class="user-header">
            <div class="user-avatar">
                <img src="${target.avatar || '/api/placeholder/48/48'}" 
                     alt="${sanitizeHTML(target.display_name || target.username)}'s avatar"
                     onerror="this.src='/api/placeholder/48/48'">
            </div>
            <div class="user-info">
                <div class="user-name">${sanitizeHTML(target.display_name || target.username)}</div>
                <div class="user-id">${sanitizeHTML(userId)}</div>
            </div>
        </div>
        <div class="report-info">
            <div class="report-type">${sanitizeHTML(report.type || 'Unknown')}</div>
            <div class="report-description">${sanitizeHTML(report.description || '')}</div>
        </div>
    `;

    // 카드 클릭 이벤트
    card.addEventListener('click', () => showUserModal(userData));

    return card;
}

function sanitizeHTML(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

function resetSearch() {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.querySelector('.search-results');
    
    searchState.isSearching = false;
    searchContainer.classList.remove('searching');
    searchResults.classList.remove('visible');
    
    // URL 파라미터 제거
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('word');
    window.history.pushState({}, '', newUrl);
}

function showError(message) {
    const errorTemplate = document.getElementById('errorTemplate');
    if (!errorTemplate) return;

    const errorClone = document.importNode(errorTemplate.content, true);
    const errorMessage = errorClone.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
    }

    const resultsGrid = document.querySelector('.results-grid');
    if (resultsGrid) {
        resultsGrid.innerHTML = '';
        resultsGrid.appendChild(errorClone);
    }
}

// 초기화 및 이벤트 리스너
document.addEventListener('DOMContentLoaded', () => {
    // 초기 상태 설정
    handleNavbarScroll();
    initializeMobileMenu();
    initializeSearch();
    initializeMouseGradient();
    // 검색창 포커스 효과
    searchInput.addEventListener('focus', () => {
        searchInput.parentElement.classList.add('search-focused');
    });

    searchInput.addEventListener('blur', () => {
        searchInput.parentElement.classList.remove('search-focused');
    });

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();
    
    initializeFilterModal();'
});

// 스크롤 이벤트
window.addEventListener('scroll', handleNavbarScroll);

// 마우스 이벤트
document.addEventListener('mousemove', handleMouseGradient);
