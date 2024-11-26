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
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const serverId = urlParams.get('server');

        if (!serverId) {
            throw new Error('Server ID not provided');
        }

        console.log('Fetching server data for ID:', serverId); // 디버깅용 로그

        // API 주소를 상대 경로로 변경
        const API_URL = `/api/servers/${serverId}`;
        
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response:', response.status, errorText); // 디버깅용 로그
            throw new Error(`Server responded with ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data); // 디버깅용 로그
        return data;

    } catch (error) {
        console.error('Error fetching server data:', error); // 디버깅용 로그
        throw new Error(`Failed to fetch server data: ${error.message}`);
    }
}

async function fetchMemberDetails(member) {
    try {
        return {
            banner: null,
            accentColor: null,
            bio: null,
            roles: member.roles ? member.roles.map(role => ({
                id: role.id,
                name: role.name,
                color: role.color || null,
                position: role.position || 0
            })) : []
        };
    } catch (error) {
        console.warn('Failed to fetch member details:', error);
        return {
            banner: null,
            accentColor: null,
            bio: null,
            roles: member.roles ? member.roles.map(role => ({
                id: role.id,
                name: role.name,
                color: role.color || null,
                position: role.position || 0
            })) : []
        };
    }
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

// 에러 메시지 표시
function showError(message) {
    const serverView = document.getElementById('serverView');
    if (!serverView) return;

    serverView.innerHTML = `
        <div class="server-view">
            <div class="error-message">
                <div class="error-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                </div>
                <h2>오류가 발생했습니다</h2>
                <p>${message}</p>
                <div class="error-actions">
                    <button class="retry-button" onclick="initializeData()">다시 시도</button>
                    <a href="../" class="home-button">홈으로 돌아가기</a>
                </div>
            </div>
        </div>
    `;
}

    async function fetchMemberDetails(member) {
        try {
            // API 주소 수정
            const userResponse = await fetch(`https://api.nexxa.kro.kr/api/discord/users/${member.id}`);
            const userData = await userResponse.json();
    
            // 서버의 역할 정보 가져오기
            const rolesResponse = await fetch(`https://api.nexxa.kro.kr/api/discord/guilds/${state.serverData.id}/members/${member.id}/roles`);
            const rolesData = await rolesResponse.json();
    
            return {
                banner: userData.banner,
                accentColor: userData.accent_color,
                bio: userData.bio,
                roles: rolesData.roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.color ? `#${role.color.toString(16).padStart(6, '0')}` : null,
                    position: role.position
                })).sort((a, b) => b.position - a.position)
            };
        } catch (error) {
            console.warn('Failed to fetch member details:', error);
            // 기본값 반환 (이전과 동일)
            return {
                banner: null,
                accentColor: null,
                bio: null,
                roles: member.roles ? member.roles.map(role => ({
                    id: role.id,
                    name: role.name,
                    color: role.color || null,
                    position: role.position || 0
                })) : []
            };
        }
    }
  
  // active.json 데이터 가져오기
    async function fetchActiveData() {
        try {
            // 경로 수정
            const response = await fetch('https://nexxa.kro.kr/ntsa/data/users/active.json');
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
        
        // 모달 HTML을 직접 생성
        const modalHTML = `
            <div class="modal-overlay">
                <div class="modal-container">
                    <div class="modal-header">
                        <h2>사용자 정보</h2>
                        <button class="modal-close">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    <div class="modal-content">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </div>
        `;
    
        // 모달을 DOM에 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 모달 요소와 컨트롤 요소들을 가져옴
        const modalElement = document.querySelector('.modal-overlay');
        const modalContent = modalElement.querySelector('.modal-content');
        const closeBtn = modalElement.querySelector('.modal-close');
    
        // 세부 정보를 비동기적으로 로드
        (async () => {
            const details = await fetchMemberDetails(member);
            
            // 프로필 컨텐츠 구성
            const profileContent = `
                <div class="profile-banner" style="${
                    details.banner ? 
                    `background-image: url('${details.banner}')` : 
                    details.accentColor ? 
                    `background-color: #${details.accentColor.toString(16).padStart(6, '0')}` :
                    'background-color: #000000'
                }"></div>
                <div class="profile-main">
                    <div class="profile-avatar-wrapper">
                        <img class="profile-avatar" 
                             src="${member.avatar || '/api/placeholder/96/96'}" 
                             alt="Profile Avatar">
                        ${isUserDangerous(userId) ? 
                            '<span class="danger-indicator">위험</span>' : ''}
                    </div>
                    <div class="profile-header">
                        <div class="profile-names">
                            <h3 class="profile-username">${member.username}</h3>
                            ${member.globalName && member.globalName !== member.username ? 
                                `<span class="global-name">${member.globalName}</span>` : ''}
                        </div>
                        ${member.nickname && member.nickname !== member.username ? 
                            `<div class="server-nickname">서버 별명: ${member.nickname}</div>` : ''}
                    </div>
                    ${details.bio ? `
                        <div class="profile-about">
                            <h4>소개</h4>
                            <p>${details.bio}</p>
                        </div>
                    ` : ''}
                    ${details.roles && details.roles.length > 0 ? `
                        <div class="profile-roles">
                            <h4>역할 (${details.roles.length})</h4>
                            <div class="roles-grid">
                                ${details.roles.map(role => `
                                    <div class="role-badge" style="border-color: ${role.color || 'transparent'}">
                                        ${role.color ? 
                                            `<span class="role-dot" style="background-color: ${role.color}"></span>` : 
                                            ''}
                                        ${role.name}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="profile-id">
                        <h4>ID</h4>
                        <code>${userId}</code>
                    </div>
                    <div class="profile-joined">
                        <h4>서버 가입일</h4>
                        <time datetime="${member.join_date}">${formatDate(member.join_date)}</time>
                    </div>
                </div>
            `;
    
            modalContent.innerHTML = profileContent;
    
            // 위험 인물 정보가 있는 경우 추가
            if (activeInfo) {
                const dangerSection = document.createElement('div');
                dangerSection.className = 'danger-info';
                dangerSection.innerHTML = `
                    <div class="danger-header">
                        <h4>위험 인물 정보</h4>
                        <span class="danger-status ${activeInfo.target.status.toLowerCase()}">
                            ${activeInfo.target.status}
                        </span>
                    </div>
                    <div class="danger-details">
                        <div class="detail-item">
                            <span class="label">신고자</span>
                            <span class="value">${activeInfo.reporter.reporter_name || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">신고 유형</span>
                            <span class="value">${activeInfo.reporter.type || 'N/A'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">신고 일시</span>
                            <span class="value">${formatDate(activeInfo.reporter.timestamp)}</span>
                        </div>
                        <div class="detail-item description">
                            <span class="label">설명</span>
                            <div class="value">${activeInfo.reporter.description || 'N/A'}</div>
                        </div>
                        ${activeInfo.reporter.evidence ? `
                            <div class="detail-item">
                                <span class="label">증거</span>
                                <a href="${activeInfo.reporter.evidence}" target="_blank" class="evidence-link">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7"/>
                                        <polyline points="16 5 21 5 21 10"/>
                                        <line x1="14" y1="12" x2="21" y2="5"/>
                                    </svg>
                                    증거 확인
                                </a>
                            </div>
                        ` : ''}
                    </div>
                `;
                modalContent.appendChild(dangerSection);
            }
        })();

        closeBtn.addEventListener('click', () => modalElement.remove());
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) modalElement.remove();
        });
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
