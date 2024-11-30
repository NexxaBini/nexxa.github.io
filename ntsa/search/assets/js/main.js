// 전역 변수 선언
let currentX = 70;
let currentY = 60;
let targetX = 70;
let targetY = 60;
let rafId = null;

// 검색 관련 상태 관리
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

// 디바운스 함수 구현
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

// 마우스 그라데이션 효과
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

    document.addEventListener('click', (e) => {
        if (navLinks?.classList.contains('active') && 
            !navLinks.contains(e.target) && 
            !mobileMenuBtn?.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });
}

// 네비게이션 바 스크롤 처리
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

// 검색 초기화
async function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.querySelector('.search-results');

    const urlParams = new URLSearchParams(window.location.search);
    const searchWord = urlParams.get('word');
    if (searchWord) {
        searchInput.value = searchWord;
        await performSearch(searchWord);
    }

    searchInput.addEventListener('input', debounce(async (e) => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('word', query);
            window.history.pushState({}, '', newUrl);

            await performSearch(query);
        } else if (query.length === 0) {
            resetSearch();
        }
    }, 500));
}

// 검색 실행
async function performSearch(query) {
    try {
        const searchContainer = document.querySelector('.search-container');
        const searchResults = document.querySelector('.search-results');

        if (!searchState.isSearching) {
            searchState.isSearching = true;
            searchContainer.classList.add('searching');
            searchResults.classList.add('visible');
        }

        const sheetsAPI = new SheetsAPI(API_KEY);
        const results = await sheetsAPI.getReportData();
        const filteredResults = filterResults(results, query);
        renderSearchResults(filteredResults);

    } catch (error) {
        console.error('Search error:', error);
        showError('검색 중 오류가 발생했습니다.');
    }
}

// 검색 결과 필터링
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

// 검색 결과 렌더링
function renderSearchResults(results) {
    const resultsGrid = document.querySelector('.results-grid');
    if (!resultsGrid) return;

    resultsGrid.innerHTML = '';

    Object.entries(results.users || {}).forEach(([userId, userData]) => {
        const card = createUserCard(userId, userData);
        resultsGrid.appendChild(card);
    });
}

// 유저 카드 생성
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

    card.addEventListener('click', () => showUserModal(userData));

    return card;
}

// HTML 이스케이프
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

// 검색 리셋
function resetSearch() {
    const searchContainer = document.querySelector('.search-container');
    const searchResults = document.querySelector('.search-results');
    
    searchState.isSearching = false;
    searchContainer.classList.remove('searching');
    searchResults.classList.remove('visible');
    
    const newUrl = new URL(window.location);
    newUrl.searchParams.delete('word');
    window.history.pushState({}, '', newUrl);
}

// 에러 표시
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

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeSearch();
    initializeMobileMenu();
    initializeMouseGradient();

    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll();
});
