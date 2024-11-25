// SafeView 페이지 전용 스크립트

// 상태 관리
const state = {
    currentView: 'all', // 'all' 또는 'dangerous'
    currentPage: 1,
    itemsPerPage: 12,
    serverData: null,
    activeData: null,
    filteredMembers: [],
};

// 데이터 로드 및 초기화
async function initializeData() {
    try {
        const [serverData, activeData] = await Promise.all([
            fetchServerData(),
            fetchActiveData()
        ]);

        state.serverData = serverData;
        state.activeData = activeData;
        
        updateView();
    } catch (error) {
        showError(error.message);
    }
}

// 서버 데이터 가져오기
async function fetchServerData() {
    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('server');

    if (!serverId) {
        throw new Error('Server ID not provided');
    }

    const API_URL = `http://localhost:8000/api/servers/${serverId}`;
    const response = await fetch(API_URL);
    
    if (!response.ok) {
        throw new Error('Failed to fetch server data');
    }

    return await response.json();
}

// active.json 데이터 가져오기
async function fetchActiveData() {
    try {
        const response = await fetch('/data/users/active.json');
        if (!response.ok) {
            console.warn('Active data not available');
            return {};
        }
        return await response.json();
    } catch (error) {
        console.warn('Failed to load active data:', error);
        return {};
    }
}

// 뷰 업데이트
function updateView() {
    // 멤버 필터링
    state.filteredMembers = filterMembers();

    // 페이지네이션 계산
    const totalPages = Math.ceil(state.filteredMembers.length / state.itemsPerPage);
    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const currentMembers = state.filteredMembers.slice(startIndex, endIndex);

    // 뷰 렌더링
    renderServerView(currentMembers, totalPages);
    updateViewControls();
}

// 멤버 필터링
function filterMembers() {
    if (!state.serverData?.members) return [];

    return state.serverData.members.filter(member => {
        if (state.currentView === 'all') return true;
        return isUserDangerous(member.id);
    });
}

// 위험 사용자 체크
function isUserDangerous(userId) {
    return state.activeData?.users?.[userId]?.target?.status === 'DANGEROUS';
}

// 유저 상세 정보 모달 표시
function showUserModal(userId) {
    const member = state.serverData.members.find(m => m.id === userId);
    const activeInfo = state.activeData?.users?.[userId];
    
    const modalTemplate = document.getElementById('userModalTemplate');
    const modalClone = document.importNode(modalTemplate.content, true);
    
    // 기본 정보 설정
    const avatar = modalClone.querySelector('.profile-avatar');
    avatar.src = member.avatar || '/api/placeholder/96/96';
    
    modalClone.querySelector('.profile-name').textContent = member.username;
    modalClone.querySelector('.profile-id').textContent = `ID: ${member.id}`;
    
    // 상세 정보 설정
    const details = modalClone.querySelector('.profile-details');
    details.innerHTML = `
        <div class="detail-group">
            <h4>서버 정보</h4>
            <div class="detail-item">
                <span class="label">가입일</span>
                <span class="value">${formatDate(member.join_date)}</span>
            </div>
            <div class="detail-item">
                <span class="label">역할</span>
                <span class="value">${member.roles.length}개</span>
            </div>
        </div>
    `;
    
    // active.json 데이터가 있는 경우 추가 정보 표시
    if (activeInfo) {
        details.innerHTML += `
            <div class="detail-group danger">
                <h4>위험 정보</h4>
                <div class="detail-item">
                    <span class="label">상태</span>
                    <span class="value">${activeInfo.target.status}</span>
                </div>
                <div class="detail-item">
                    <span class="label">신고자</span>
                    <span class="value">${activeInfo.reporter.reporter_name || 'N/A'}</span>
                </div>
                <div class="detail-item">
                    <span class="label">신고 일시</span>
                    <span class="value">${formatDate(activeInfo.reporter.timestamp)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">신고 유형</span>
                    <span class="value">${activeInfo.reporter.type || 'N/A'}</span>
                </div>
                <div class="detail-item description">
                    <span class="label">설명</span>
                    <span class="value">${activeInfo.reporter.description || 'N/A'}</span>
                </div>
            </div>
        `;
    }
    
    // 모달 이벤트 설정
    const modal = modalClone.querySelector('.modal-overlay');
    const closeBtn = modalClone.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modalClone);
}

// 서버 뷰 렌더링
function renderServerView(members, totalPages) {
    const serverView = document.getElementById('serverView');
    const template = document.getElementById('serverViewTemplate');
    const clone = document.importNode(template.content, true);

    // 서버 이름 설정
    clone.querySelector('.server-name').textContent = state.serverData.server_name;

    // 카운트 업데이트
    const allCount = state.serverData.members.length;
    const dangerousCount = state.serverData.members.filter(m => isUserDangerous(m.id)).length;

    clone.querySelector('[data-view="all"] .count').textContent = `(${allCount})`;
    clone.querySelector('[data-view="dangerous"] .count').textContent = `(${dangerousCount})`;

    // 뷰 스위치 버튼 상태 설정
    const viewBtns = clone.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === state.currentView);
        btn.addEventListener('click', () => {
            if (btn.dataset.view !== state.currentView) {
                state.currentView = btn.dataset.view;
                state.currentPage = 1;
                updateView();
            }
        });
    });

    // 멤버 카드 렌더링
    const membersGrid = clone.querySelector('.members-grid');
    members.forEach(member => {
        const card = renderMemberCard(member);
        membersGrid.appendChild(card);
    });

    // 페이지네이션 업데이트
    updatePagination(clone, totalPages);

    // DOM에 추가
    serverView.innerHTML = '';
    serverView.appendChild(clone);

    // 카드 애니메이션
    animateMemberCards();
}

// 멤버 카드 렌더링
function renderMemberCard(member) {
    const template = document.getElementById('memberCardTemplate');
    const card = document.importNode(template.content, true);

    const isDangerous = isUserDangerous(member.id);
    const activeInfo = state.activeData?.users?.[member.id];

    // 기본 정보 설정
    card.querySelector('.member-avatar').src = member.avatar || '/api/placeholder/48/48';
    card.querySelector('.member-name').textContent = member.username;
    card.querySelector('.member-id').textContent = `ID: ${member.id}`;
    card.querySelector('.join-date').textContent = formatDate(member.join_date);
    card.querySelector('.roles-count').textContent = `${member.roles.length}개`;

    // 상태 표시
    const statusDot = card.querySelector('.status-dot');
    if (isDangerous) {
        statusDot.classList.add('dangerous');
        statusDot.title = '위험 인물';
    }

    // 클릭 이벤트
    const cardElement = card.querySelector('.member-card');
    cardElement.addEventListener('click', () => showUserModal(member.id));
    
    // 위험 인물인 경우 스타일 적용
    if (isDangerous) {
        cardElement.classList.add('dangerous');
    }

    return card;
}

// 페이지네이션 업데이트
function updatePagination(container, totalPages) {
    const paginationInfo = container.querySelector('.pagination-info');
    const prevBtn = container.querySelector('.pagination-btn.prev');
    const nextBtn = container.querySelector('.pagination-btn.next');

    // 페이지 정보 업데이트
    paginationInfo.innerHTML = `
        <span class="current-page">${state.currentPage}</span>
        <span class="total-pages">/ ${totalPages}</span>
    `;

    // 버튼 상태 업데이트
    prevBtn.disabled = state.currentPage === 1;
    nextBtn.disabled = state.currentPage === totalPages;

    // 이벤트 리스너
    prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            updateView();
        }
    });

    nextBtn.addEventListener('click', () => {
        if (state.currentPage < totalPages) {
            state.currentPage++;
            updateView();
        }
    });
}

// 카드 애니메이션
function animateMemberCards() {
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

// 뷰 컨트롤 업데이트
function updateViewControls() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === state.currentView);
    });
}

// 날짜 포맷팅
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
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

// 마우스 그라데이션 효과
function initializeMouseGradient() {
    let currentX = 70;
    let currentY = 60;
    let targetX = 70;
    let targetY = 60;
    let rafId = null;

    function handleMouseGradient(e) {
        const mouseGradient = document.querySelector('.mouse-gradient');
        if (!mouseGradient) return;

        const rect = mouseGradient.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        targetX = (x / rect.width) * 100;
        targetY = (y / rect.height) * 100;

        if (!rafId) {
            rafId = requestAnimationFrame(animate);
        }
    }

    function animate() {
        const mouseGradient = document.querySelector('.mouse-gradient');
        if (!mouseGradient) {
            rafId = null;
            return;
        }

        currentX += (targetX - currentX) * 0.1;
        currentY += (targetY - currentY) * 0.1;

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

    document.addEventListener('mousemove', handleMouseGradient);
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeMouseGradient();
    initializeData();
});
