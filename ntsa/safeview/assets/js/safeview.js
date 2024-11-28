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
    
    // 현재 뷰에 따른 필터링
    if (state.currentView === 'dangerous') {
        filtered = filtered.filter(member => isUserReported(member.id));
    }
    
    // 검색어 필터링
    if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        filtered = filtered.filter(member => {
            const displayName = (member.display_name || '').toLowerCase();
            const username = (member.username || '').toLowerCase();
            const id = member.id || '';
            const roles = member.roles?.map(role => role.name.toLowerCase()) || [];
            
            return displayName.includes(query) || 
                   username.includes(query) || 
                   id.includes(query) ||
                   roles.some(role => role.includes(query));
        });
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
        // GitHub Pages에서의 절대 경로 사용
        const response = await fetch('/ntsa/data/users/active.json');
        if (!response.ok) {
            console.warn('Active data not available:', response.status);
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

// 뷰 전환 이벤트 핸들러 추가
document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view-btn');
    if (viewBtn) {
        const view = viewBtn.dataset.view;
        state.currentView = view;
        state.currentPage = 1;
        updateView();
    }
});

// 멤버 카드 렌더링 함수 수정
function renderMemberCard(member) {
    const template = document.getElementById('memberCardTemplate');
    const card = document.importNode(template.content, true);
    
    const cardElement = card.querySelector('.member-card');
    const nameElement = card.querySelector('.member-name');
    
    // 기본 정보 설정
    nameElement.textContent = member.display_name || member.username;
    
    // 아바타 설정
    const avatarImg = card.querySelector('.member-avatar');
    avatarImg.src = member.avatar || DEFAULT_AVATAR;
    avatarImg.alt = `${member.display_name || member.username}'s avatar`;
    avatarImg.onerror = () => { avatarImg.src = DEFAULT_AVATAR; };

    // ID 설정
    const memberId = card.querySelector('.member-id');
    memberId.textContent = member.id;

    // 가입일 설정
    const joinDate = card.querySelector('.join-date');
    joinDate.textContent = formatDate(member.join_date);

    // 역할 수 설정
    const rolesCount = card.querySelector('.roles-count');
    rolesCount.textContent = `${member.roles?.length || 0}개`;

    // 봇 표시
    if (member.bot) {
        cardElement.classList.add('is-bot');
        const botBadge = document.createElement('span');
        botBadge.className = 'bot-badge';
        botBadge.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1-8.313-12.454z"/>
            </svg>
            BOT
        `;
        nameElement.appendChild(botBadge);
    }

    // 신고된 유저 표시
    if (isUserReported(member.id)) {
        cardElement.classList.add('reported');
        const reportBadge = document.createElement('div');
        reportBadge.className = 'report-badge';
        reportBadge.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            신고됨
        `;
        cardElement.appendChild(reportBadge);
    }

    // 클릭 이벤트 추가
    cardElement.addEventListener('click', () => showUserModal(member));

    return card;
}

// 역할 렌더링 함수 수정 (페이지네이션 추가)
function renderUserRoles(member, page = 1) {
    if (!member.roles?.length) {
        return '<div class="no-roles">역할 없음</div>';
    }

    const rolesPerPage = 10;
    const totalPages = Math.ceil(member.roles.length / rolesPerPage);
    const start = (page - 1) * rolesPerPage;
    const end = start + rolesPerPage;
    const currentRoles = member.roles.slice(start, end);

    let html = `
        <div class="roles-content">
            ${currentRoles.map(role => `
                <div class="role-badge" style="border-color: ${role.color}">
                    <span class="role-dot" style="background-color: ${role.color}"></span>
                    ${sanitizeHTML(role.name)}
                </div>
            `).join('')}
        </div>
    `;

    if (totalPages > 1) {
        html += `
            <div class="roles-pagination">
                ${Array.from({ length: totalPages }, (_, i) => i + 1)
                    .map(num => `
                        <span class="roles-page ${num === page ? 'active' : ''}"
                              data-page="${num}">
                            ${num}
                        </span>
                    `).join('')}
            </div>
        `;
    }

    return html;
}

function showUserModal(member) {
    // 1. 기본 검증
    if (!member) {
        console.error('Member data is required');
        return;
    }

    try {
        // 2. 필요한 데이터와 템플릿 준비
        const activeInfo = state.activeData?.users?.[member.id];
        const modalTemplate = document.getElementById('userModalTemplate');
        
        if (!modalTemplate) {
            console.error('Modal template not found');
            return;
        }

        // 3. 모달 클론 생성
        const modalClone = document.importNode(modalTemplate.content, true);
        const modalContent = modalClone.querySelector('.modal-content');

        // 4. 모달 내용 렌더링
        modalContent.innerHTML = `
            <div class="profile-banner"></div>
            <div class="profile-main">
                <div class="profile-avatar-wrapper">
                    <img class="profile-avatar" 
                         src="${member.avatar || DEFAULT_AVATAR}" 
                         alt="Profile Avatar"
                         onerror="this.src='${DEFAULT_AVATAR}'">
                    ${isUserReported(member.id) ? '<span class="danger-indicator">신고됨</span>' : ''}
                </div>
                
                <!-- 기본 정보 섹션 -->
                <div class="collapsible-section">
                    <div class="collapsible-header">
                        <h3>기본 정보</h3>
                        <svg class="toggle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="collapsible-content">
                        <div class="profile-names">
                            <h3 class="profile-username">
                                ${member.username}
                                ${member.bot ? `<span class="bot-badge">BOT</span>` : ''}
                            </h3>
                            ${member.display_name && member.display_name !== member.username ? 
                                `<span class="global-name">${member.display_name}</span>` : ''}
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
                </div>

                <!-- 역할 섹션 -->
                <div class="collapsible-section">
                    <div class="collapsible-header">
                        <h3>역할 (${member.roles?.length || 0})</h3>
                        <svg class="toggle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="collapsible-content">
                        <div class="roles-grid">
                            ${renderUserRoles(member)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 5. 신고 정보 섹션 추가 (있는 경우)
        if (activeInfo?.reporter) {
            const dangerSection = document.createElement('div');
            dangerSection.className = 'collapsible-section';
            dangerSection.innerHTML = `
                <div class="collapsible-header">
                    <h3>신고 정보</h3>
                    <svg class="toggle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
                <div class="collapsible-content">
                    ${generateDangerInfo(activeInfo)}
                </div>
            `;
            modalContent.appendChild(dangerSection);
        }

        // 6. 접기/펼치기 이벤트 핸들러 설정
        modalContent.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.classList.toggle('expanded');
                header.querySelector('.toggle-icon').style.transform = 
                    content.classList.contains('expanded') ? 'rotate(180deg)' : '';
            });
        });

        // 7. 역할 페이지네이션 이벤트 핸들러 설정
        modalContent.addEventListener('click', (e) => {
            const pageBtn = e.target.closest('.roles-page');
            if (pageBtn) {
                const page = parseInt(pageBtn.dataset.page);
                const rolesGrid = modalContent.querySelector('.roles-grid');
                rolesGrid.innerHTML = renderUserRoles(member, page);
            }
        });

        // 8. 모달 닫기 버튼 및 오버레이 클릭 이벤트 설정
        const modalOverlay = modalClone.querySelector('.modal-overlay');
        const closeBtn = modalClone.querySelector('.modal-close');

        const closeModal = () => modalOverlay.remove();

        closeBtn.onclick = closeModal;
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) closeModal();
        };

        // 9. 모달을 DOM에 추가 (여기가 마지막 위치입니다)
        document.body.appendChild(modalClone);
        
        // 10. 첫 번째 섹션 자동 펼치기
        modalContent.querySelector('.collapsible-content').classList.add('expanded');

    } catch (error) {
        console.error('Error showing user modal:', error);
    }
}

function processRoles(member) {
    if (!member.roles || !Array.isArray(member.roles)) return [];
    
    return member.roles.sort((a, b) => {
        // 높은 포지션이 먼저 오도록 정렬
        return (b.position || 0) - (a.position || 0);
    });
}
    
function generateDangerInfo(activeInfo) {
    if (!activeInfo?.reporter) return ''; // reporter 정보가 없으면 빈 문자열 반환

    const reporter = activeInfo.reporter;
    
    return `
        <div class="danger-header">
            <h4>신고 정보</h4>
        </div>
        <div class="danger-details">
            <div class="detail-item">
                <span class="label">신고자</span>
                <span class="value">${sanitizeHTML(reporter.reporter_name || 'N/A')}</span>
            </div>
            <div class="detail-item">
                <span class="label">신고 유형</span>
                <span class="value">${reporter.type || 'N/A'}</span>
            </div>
            <div class="detail-item">
                <span class="label">신고 일시</span>
                <span class="value">${formatDate(reporter.timestamp) || 'N/A'}</span>
            </div>
            ${reporter.description ? `
                <div class="detail-item description">
                    <span class="label">설명</span>
                    <div class="value">${sanitizeHTML(reporter.description)}</div>
                </div>
            ` : ''}
            ${reporter.evidence ? `
                <div class="detail-item">
                    <span class="label">증거</span>
                    <a href="/ntsa/data/evidence/${reporter.evidence}" 
                       target="_blank" 
                       class="evidence-link">
                        증거 확인
                    </a>
                </div>
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
        const viewBtn = e.target.closest('.view-btn');
        if (viewBtn) {
            const view = viewBtn.dataset.view;
            state.currentView = view;
            state.currentPage = 1;
            updateView();
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


function isUserReported(userId) {
    return state.activeData?.users?.[userId]?.reporter != null;
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
    const dangerousCount = state.serverData.members.filter(m => isUserReported(m.id)).length;

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
