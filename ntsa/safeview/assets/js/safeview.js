// SafeView 페이지 전용 스크립트

const state = {
    currentView: 'all',
    currentPage: 1,
    itemsPerPage: 12,
    serverData: null,
    activeData: null,
    filteredMembers: [],
    searchQuery: '',  // 검색어 상태 추가
};

// 에러 처리 함수
function showError(message) {
    const serverView = document.getElementById('serverView');
    const errorTemplate = document.getElementById('errorTemplate');
    const errorClone = document.importNode(errorTemplate.content, true);
    
    // 에러 메시지 설정
    errorClone.querySelector('.error-message').textContent = message;
    
    // 재시도 버튼 이벤트 설정
    const retryButton = errorClone.querySelector('.retry-button');
    retryButton.addEventListener('click', () => {
        initializeData();
    });

    // 현재 내용을 에러 메시지로 교체
    serverView.innerHTML = '';
    serverView.appendChild(errorClone);
}

// 로딩 표시 함수
function showLoading() {
    const serverView = document.getElementById('serverView');
    const loadingTemplate = document.getElementById('loadingTemplate');
    const loadingClone = document.importNode(loadingTemplate.content, true);
    
    serverView.innerHTML = '';
    serverView.appendChild(loadingClone);
}

// 데이터 로드 및 초기화
async function initializeData() {
    try {
        showLoading();
        
        const [serverData, activeData] = await Promise.all([
            fetchServerData(),
            fetchActiveData()
        ]);

        state.serverData = serverData;
        state.activeData = activeData;
        
        updateView();
    } catch (error) {
        showError(error.message || '데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

function initializeSearch() {
    // 전역 이벤트 위임을 통한 검색 처리
    document.addEventListener('input', function(e) {
        if (e.target && e.target.id === 'memberSearch') {
            const searchInput = e.target;
            const currentValue = searchInput.value;
            
            // 디바운스된 검색 실행
            debounce(() => {
                // 현재 입력값이 변경되지 않은 경우에만 검색 실행
                if (currentValue === searchInput.value) {
                    state.searchQuery = currentValue.trim();
                    state.currentPage = 1;
                    updateView();
                }
            }, 500)(); // 디바운스 시간을 500ms로 증가
        }
    });

    // Enter 키 처리
    document.addEventListener('keydown', function(e) {
        if (e.target && e.target.id === 'memberSearch' && e.key === 'Enter') {
            e.preventDefault();
            const searchInput = e.target;
            state.searchQuery = searchInput.value.trim();
            state.currentPage = 1;
            updateView();
        }
    });

    // 검색창 포커스 관리
    document.addEventListener('focusin', function(e) {
        if (e.target && e.target.id === 'memberSearch') {
            e.target.closest('.search-container')?.classList.add('search-focused');
        }
    });

    document.addEventListener('focusout', function(e) {
        if (e.target && e.target.id === 'memberSearch') {
            // 다른 요소로 포커스가 이동할 때만 포커스 스타일 제거
            setTimeout(() => {
                if (!e.target.contains(document.activeElement)) {
                    e.target.closest('.search-container')?.classList.remove('search-focused');
                }
            }, 0);
        }
    });
}

// 검색 결과 필터링 함수 개선
function filterMembers() {
    if (!state.serverData?.members) return [];

    let filtered = state.serverData.members;
    
    // 검색어가 있는 경우 필터링
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(member => {
            const displayName = (member.display_name || '').toLowerCase();
            const username = (member.username || '').toLowerCase();
            const id = member.id || '';
            const roles = member.roles?.map(role => role.name.toLowerCase()) || [];
            
            // 검색 범위 확장
            return displayName.includes(query) || 
                   username.includes(query) || 
                   id.includes(query) ||
                   roles.some(role => role.includes(query));
        });
    }

    // 현재 뷰에 따른 필터링
    if (state.currentView === 'dangerous') {
        filtered = filtered.filter(member => isUserDangerous(member.id));
    }

    return filtered;
}

// debounce 함수 개선
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

// 서버 데이터 가져오기
async function fetchServerData() {
    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('server');

    if (!serverId) {
        throw new Error('Server ID not provided');
    }

    // API에서 서버 데이터 가져오기
    const API_URL = `http://localhost:8000/api/servers/${serverId}`;
    const response = await fetch(API_URL);
    
    if (!response.ok) {
        throw new Error('Failed to fetch server data');
    }

    const data = await response.json();
    
    // 역할 정보 처리
    data.members = data.members.map(member => ({
        ...member,
        processedRoles: processRoles(member.roles, data.roles || {})
    }));

    return data;
}

function processRoles(memberRoles, serverRoles) {
    if (!Array.isArray(memberRoles)) return [];
    
    return memberRoles
        .map(roleId => {
            const roleInfo = serverRoles[roleId] || {};
            return {
                id: roleId,
                name: roleInfo.name || 'Unknown Role',
                color: roleInfo.color || '#99AAB5',
                position: roleInfo.position || 0
            };
        })
        .sort((a, b) => b.position - a.position); // 높은 포지션이 먼저 오도록 정렬
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

// 위험 사용자 체크
function isUserDangerous(userId) {
  return state.activeData?.users?.[userId]?.target?.status === 'DANGEROUS';
}

function renderMemberCard(member) {
    const template = document.getElementById('memberCardTemplate');
    const card = document.importNode(template.content, true);
    
    const cardElement = card.querySelector('.member-card');
    const nameElement = card.querySelector('.member-name');
    
    // 봇 표시 추가
    if (member.bot) {
        cardElement.classList.add('is-bot');
        nameElement.innerHTML = `
            ${member.display_name || member.username}
            <span class="bot-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/>
                </svg>
                BOT
            </span>
        `;
    } else {
        nameElement.textContent = member.display_name || member.username;
    }

    // 아바타 설정
    const avatarImg = card.querySelector('.member-avatar');
    avatarImg.src = member.avatar || DEFAULT_AVATAR;
    avatarImg.onerror = () => { avatarImg.src = DEFAULT_AVATAR; };

    // 기본 정보 설정
    card.querySelector('.member-id').textContent = `ID: ${member.id}`;
    card.querySelector('.join-date').textContent = formatDate(member.join_date);
    card.querySelector('.roles-count').textContent = `${member.roles?.length || 0}개`;

    // 위험 상태 표시
    const statusDot = card.querySelector('.status-dot');
    if (isUserDangerous(member.id)) {
        statusDot.classList.add('dangerous');
        statusDot.title = '위험 인물';
        cardElement.classList.add('dangerous');
    }

    // 클릭 이벤트
    cardElement.onclick = (e) => {
        e.preventDefault();
        showUserModal(member);
    };

    return card;
}

// 유저 상세 정보 모달 표시
function showUserModal(member) {
    if (!member) return;

    const activeInfo = state.activeData?.users?.[member.id];
    const modalTemplate = document.getElementById('userModalTemplate');
    const modalClone = document.importNode(modalTemplate.content, true);

    const modalContent = modalClone.querySelector('.modal-content');
    
    modalContent.innerHTML = `
        <div class="profile-banner"></div>
        <div class="profile-main">
            <div class="profile-avatar-wrapper">
                <img class="profile-avatar" 
                     src="${member.avatar || DEFAULT_AVATAR}" 
                     alt="Profile Avatar"
                     onerror="this.src='${DEFAULT_AVATAR}'">
                ${isUserDangerous(member.id) ? '<span class="danger-indicator">위험</span>' : ''}
            </div>
            <div class="profile-header">
                <div class="profile-names">
                    <h3 class="profile-username">
                        ${member.username}
                        ${member.bot ? `
                            <span class="bot-badge">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/>
                                </svg>
                                BOT
                            </span>
                        ` : ''}
                    </h3>
                    ${member.display_name && member.display_name !== member.username ? 
                        `<span class="global-name">${member.display_name}</span>` : ''}
                </div>
            </div>
            <div class="profile-roles">
                <h4>역할 (${member.roles?.length || 0})</h4>
                <div class="roles-grid">
                    ${renderUserRoles(member)}
                </div>
            </div>
            <div class="profile-id">
                <h4>ID</h4>
                <code>${member.id}</code>
            </div>
            <div class="profile-joined">
                <h4>서버 가입일</h4>
                <time datetime="${member.join_date}">${formatDate(member.join_date)}</time>
            </div>
        </div>
    `;

    if (activeInfo?.target) {
        const dangerSection = document.createElement('div');
        dangerSection.className = 'danger-info';
        dangerSection.innerHTML = generateDangerInfo(activeInfo);
        modalContent.appendChild(dangerSection);
    }

    const modalOverlay = modalClone.querySelector('.modal-overlay');
    const closeBtn = modalClone.querySelector('.modal-close');

    const closeModal = () => modalOverlay.remove();

    closeBtn.onclick = closeModal;
    modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) closeModal();
    };

    document.body.appendChild(modalClone);
}

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

function generateDangerInfo(activeInfo) {
    return `
        <div class="danger-header">
            <h4>위험 인물 정보</h4>
            <span class="danger-status ${activeInfo.target.status.toLowerCase()}">
                ${activeInfo.target.status}
            </span>
        </div>
        <div class="danger-details">
            ${activeInfo.reporter ? `
                <div class="detail-item">
                    <span class="label">신고자</span>
                    <span class="value">${sanitizeHTML(activeInfo.reporter.reporter_name)}</span>
                </div>
                <div class="detail-item">
                    <span class="label">신고 유형</span>
                    <span class="value">${activeInfo.reporter.type}</span>
                </div>
                <div class="detail-item">
                    <span class="label">신고 일시</span>
                    <span class="value">${formatDate(activeInfo.reporter.timestamp)}</span>
                </div>
                ${activeInfo.reporter.description ? `
                    <div class="detail-item description">
                        <span class="label">설명</span>
                        <div class="value">${sanitizeHTML(activeInfo.reporter.description)}</div>
                    </div>
                ` : ''}
                ${activeInfo.reporter.evidence ? `
                    <div class="detail-item">
                        <span class="label">증거</span>
                        <a href="/data/evidence/${activeInfo.reporter.evidence}" 
                           target="_blank" 
                           class="evidence-link">
                            증거 확인
                        </a>
                    </div>
                ` : ''}
            ` : ''}
        </div>
    `;
}

// 모달 이벤트 설정
function setupModalEvents(modalClone) {
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
}

// HTML 이스케이프 함수
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

function renderUserRoles(member) {
    if (!member.roles?.length) {
        return '<div class="no-roles">역할 없음</div>';
    }

    return member.roles
        .map(role => `
            <div class="role-badge" style="border-color: ${role.color}">
                <span class="role-dot" style="background-color: ${role.color}"></span>
                ${sanitizeHTML(role.name)}
            </div>
        `)
        .join('');
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


// 서버 뷰 렌더링
function renderServerView(members, totalPages) {
    const serverView = document.getElementById('serverView');
    const template = document.getElementById('serverViewTemplate');
    const clone = document.importNode(template.content, true);
    
    // 현재 검색창의 상태 저장
    const currentSearchInput = document.getElementById('memberSearch');
    const currentValue = currentSearchInput ? currentSearchInput.value : state.searchQuery;
    const currentSelectionStart = currentSearchInput ? currentSearchInput.selectionStart : 0;
    const currentSelectionEnd = currentSearchInput ? currentSearchInput.selectionEnd : 0;
    const wasFocused = currentSearchInput === document.activeElement;

    // 기본 뷰 설정
    clone.querySelector('.server-name').textContent = state.serverData.server_name;

    // 멤버 카드 렌더링
    const membersGrid = clone.querySelector('.members-grid');
    members.forEach(member => {
        const card = renderMemberCard(member);
        membersGrid.appendChild(card);
    });

    // 검색창 상태 복원
    const newSearchInput = clone.querySelector('#memberSearch');
    if (newSearchInput) {
        newSearchInput.value = currentValue || '';
        if (wasFocused) {
            // 비동기적으로 포커스와 커서 위치 복원
            setTimeout(() => {
                newSearchInput.focus();
                newSearchInput.setSelectionRange(currentSelectionStart, currentSelectionEnd);
                newSearchInput.closest('.search-container').classList.add('search-focused');
            }, 0);
        }
    }

    // 카운트 업데이트
    const allCount = state.serverData.members.length;
    const dangerousCount = state.serverData.members.filter(m => isUserDangerous(m.id)).length;

    clone.querySelector('[data-view="all"] .count').textContent = `(${allCount})`;
    clone.querySelector('[data-view="dangerous"] .count').textContent = `(${dangerousCount})`;

    // 페이지네이션 업데이트
    updatePagination(clone, totalPages);

    // DOM 업데이트
    serverView.innerHTML = '';
    serverView.appendChild(clone);

    // 카드 애니메이션
    animateMemberCards();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeMouseGradient();
    initializeSearch();  // Add the new initialization
    initializeData();
    
    // 초기 상태 설정
    handleNavbarScroll();
    
    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', handleNavbarScroll);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modalOverlay = document.querySelector('.modal-overlay');
        if (modalOverlay) modalOverlay.remove();
    }
});

const DEFAULT_AVATAR = 'https://cdn.discordapp.com/embed/avatars/0.png';
