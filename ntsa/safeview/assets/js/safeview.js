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

let sheetsAPI;

// 에러 처리 함수
function showError(message) {
    const serverView = document.getElementById('serverView');
    const errorTemplate = document.getElementById('errorTemplate');
    const errorClone = document.importNode(errorTemplate.content, true);
    
    const errorMessage = errorClone.querySelector('.error-message');
    errorMessage.textContent = message;
    
    const retryButton = errorClone.querySelector('.retry-button');
    retryButton.addEventListener('click', () => {
        initializeData();
    });

    const homeButton = errorClone.querySelector('.home-button');
    if (homeButton) {
        homeButton.href = '/ntsa/';
    }

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

async function initializeAPI() {
    try {
        // 전역으로 정의된 API_KEY 사용
        sheetsAPI = new SheetsAPI(API_KEY);
    } catch (error) {
        console.error('Failed to initialize API:', error);
        showError('API 초기화 실패');
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

// 초기화 함수 수정
async function initializeData() {
    try {
        showLoading();
        
        await initializeAPI();
        const urlParams = new URLSearchParams(window.location.search);
        const serverId = urlParams.get('server');
        
        console.log('URL parameters:', Object.fromEntries(urlParams)); // 디버깅
        console.log('Server ID from URL:', serverId); // 디버깅

        if (!serverId) {
            showError('서버 ID가 제공되지 않았습니다.');
            return;
        }

        try {
            // Promise.all 대신 순차적으로 실행하여 오류 추적을 용이하게 함
            const serverData = await sheetsAPI.getSheetData(serverId);
            console.log('Server data loaded:', serverData ? 'success' : 'empty'); // 디버깅
            
            if (!serverData || !serverData.length) {
                showError('서버 데이터를 찾을 수 없습니다. /safeview update 명령어를 사용해주세요.');
                return;
            }

            const reportData = await sheetsAPI.getReportData();
            console.log('Report data loaded:', reportData ? 'success' : 'empty'); // 디버깅
            
            state.serverData = formatSheetData(serverData, serverId);
            state.activeData = reportData;
            state.filteredMembers = filterMembers();
            updateView();
        } catch (error) {
            console.error('Data loading error:', error); // 디버깅
            
            if (error.message.includes('404')) {
                showError('서버 데이터를 찾을 수 없습니다. /safeview update 명령어를 사용하여 데이터를 먼저 생성해주세요.');
            } else if (error.message.includes('403')) {
                showError('스프레드시트 접근 권한이 없습니다. 관리자에게 문의해주세요.');
            } else {
                showError(`데이터를 불러오는데 실패했습니다: ${error.message}`);
            }
        }
    } catch (error) {
        console.error('Initialization error:', error); // 디버깅
        showError('초기화 중 오류가 발생했습니다.');
    }
}

// 검색 결과 필터링 함수 개선
function filterMembers() {
    if (!state.serverData?.members) return [];

    let filtered = state.serverData.members;
    
    // 현재 뷰에 따른 필터링
    if (state.currentView === 'dangerous') {
        filtered = filtered.filter(member => {
            const isReported = isUserReported(member.id);
            console.log('Member:', member.id, 'Is reported:', isReported);
            return isReported;
        });
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
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const spreadsheetId = urlParams.get('server');
        
        if (!spreadsheetId) {
            showError('스프레드시트 ID가 제공되지 않았습니다.');
            return null;
        }

        console.log('Fetching data for spreadsheet:', spreadsheetId); // 디버깅용

        const rows = await sheetsAPI.getSheetData(spreadsheetId);
        
        // 데이터가 비어있는 경우 처리
        if (!rows || rows.length === 0) {
            showError('스프레드시트에 데이터가 없습니다.');
            return null;
        }

        return formatSheetData(rows, spreadsheetId);
    } catch (error) {
        console.error('Error fetching server data:', error);
        
        if (error.message.includes('404')) {
            showError('스프레드시트를 찾을 수 없습니다. ID를 확인해주세요.');
        } else if (error.message.includes('403')) {
            showError('접근 권한이 없습니다. 스프레드시트 공유 설정을 확인해주세요.');
        } else {
            showError('데이터를 불러오는데 실패했습니다.');
        }
        
        throw new Error('Failed to fetch sheet data');
    }
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

async function fetchActiveData() {
    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1!A2:M?key=${SHEETS_API_KEY}`
        );
        
        if (!response.ok) {
            console.warn('Failed to fetch sheet data:', response.status);
            return {};
        }
        
        const data = await response.json();
        return formatSheetData(data);
    } catch (error) {
        console.error('Error fetching sheet data:', error);
        return {};
    }
}

// 스프레드시트 데이터를 기존 active.json 형식으로 변환
function formatSheetData(rows, serverId) {
    if (!Array.isArray(rows)) {
        console.error('Invalid data format: rows is not an array');
        return {
            server_id: serverId,
            server_name: `Server ${serverId}`,
            member_count: 0,
            members: []
        };
    }

    // Servers 시트에서 서버 이름 가져오기
    async function getServerName() {
        try {
            const response = await fetch(
                `${SPREADSHEET_BASE_URL}/${REPORT_SPREADSHEET_ID}/values/Servers!A2:C?key=${API_KEY}`
            );
            if (!response.ok) throw new Error('Failed to fetch server data');
            
            const data = await response.json();
            const serverRow = (data.values || []).find(row => row[0] === serverId);
            return serverRow ? serverRow[2] : `Server ${serverId}`;
        } catch (error) {
            console.error('Error fetching server name:', error);
            return `Server ${serverId}`;
        }
    }

    const formattedData = {
        server_id: serverId,
        server_name: null,  // 나중에 설정됨
        member_count: rows.length,
        members: []
    };

    try {
        formattedData.members = rows.map(row => {
            if (!Array.isArray(row) || row.length < 11) {
                console.warn('Invalid row format:', row);
                return null;
            }

            let roles = [];
            if (row[5] && row[6] && row[7]) {
                const roleIds = row[5].split(',');
                const roleNames = row[6].split(',');
                const roleColors = row[7].split(',');
                
                roles = roleIds.map((id, index) => ({
                    id: id.trim(),
                    name: roleNames[index] ? roleNames[index].trim() : '',
                    color: roleColors[index] ? roleColors[index].trim() : '#99AAB5',
                    position: roleIds.length - index
                })).filter(role => role.id);
            }

            return {
                id: row[0],
                username: row[1],
                display_name: row[2] || row[1],
                avatar: row[3] || "https://cdn.discordapp.com/embed/avatars/0.png",
                join_date: row[4],
                roles: roles,
                bot: row[8] === 'True',
                nickname: row[9] || null,
                last_updated: row[10]
            };
        }).filter(member => member !== null);

        // 서버 이름 가져오기
        getServerName().then(name => {
            formattedData.server_name = name;
            // 서버 이름을 가져온 후 뷰 업데이트
            const serverNameElement = document.querySelector('.server-name');
            if (serverNameElement) {
                serverNameElement.textContent = name;
            }
        });

    } catch (error) {
        console.error('Error formatting sheet data:', error);
        formattedData.members = [];
    }

    return formattedData;
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
function renderUserRoles(member) {
    if (!member.roles?.length) {
        return '<div class="no-roles">역할 없음</div>';
    }

    return `
        <div class="roles-grid">
            ${member.roles.map(role => `
                <div class="role-badge" style="border-color: ${role.color}">
                    <span class="role-dot" style="background-color: ${role.color}"></span>
                    ${sanitizeHTML(role.name)}
                </div>
            `).join('')}
        </div>
    `;
}

function showUserModal(member) {
    if (!member) {
        console.error('Member data is required');
        return;
    }

    try {
        const activeInfo = state.activeData?.users?.[member.id];
        const modalTemplate = document.getElementById('userModalTemplate');
        
        if (!modalTemplate) {
            console.error('Modal template not found');
            return;
        }

        const modalClone = document.importNode(modalTemplate.content, true);
        const modalContent = modalClone.querySelector('.modal-content');

        // 기본 모달 내용 렌더링
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
                
                <!-- 기본 정보 -->
                <div class="profile-info-section">
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

                <!-- 역할 섹션 -->
                <div class="collapsible-section">
                    <div class="collapsible-header">
                        <h3>역할 (${member.roles?.length || 0})</h3>
                        <svg class="toggle-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </div>
                    <div class="collapsible-content roles-content">
                        ${renderUserRoles(member)}
                    </div>
                </div>
            </div>
        `;

        // 신고 정보 섹션 추가 (있는 경우)
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

        setupCollapsibleSections(modalContent);
    
        // 모달 닫기 이벤트 설정 전에 모든 섹션을 닫힌 상태로 초기화
        modalContent.querySelectorAll('.collapsible-content').forEach(content => {
            content.classList.remove('expanded');
            const icon = content.previousElementSibling?.querySelector('.toggle-icon');
            if (icon) {
                icon.style.transform = 'rotate(0deg)';
            }
        });

        // 모달 닫기 기능
        const modalOverlay = modalClone.querySelector('.modal-overlay');
        const closeBtn = modalClone.querySelector('.modal-close');
        const closeModal = () => modalOverlay.remove();

        closeBtn.onclick = closeModal;
        modalOverlay.onclick = (e) => {
            if (e.target === modalOverlay) closeModal();
        };

        document.body.appendChild(modalClone);
        
        // 첫 번째 섹션 자동 펼치기
        const firstCollapsible = modalContent.querySelector('.collapsible-content');
        if (firstCollapsible) {
            firstCollapsible.classList.add('expanded');
            const header = firstCollapsible.previousElementSibling;
            if (header?.querySelector('.toggle-icon')) {
                header.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
            }
        }

    } catch (error) {
        console.error('Error showing user modal:', error);
    }
}

function setupCollapsibleSections(modalContent) {
    modalContent.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');
            content.classList.toggle('expanded');
            
            if (content.classList.contains('expanded')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
}

function processRoles(member) {
    if (!member.roles || !Array.isArray(member.roles)) return [];
    
    return member.roles.sort((a, b) => {
        // 높은 포지션이 먼저 오도록 정렬
        return (b.position || 0) - (a.position || 0);
    });
}
    
function generateDangerInfo(activeInfo) {
    if (!activeInfo?.reporter) return '';

    const reporter = activeInfo.reporter;
    const status = activeInfo.target?.status || 'WARNING';
    
    // 신고자 ID 마스킹 함수
    function maskId(id) {
        if (!id) return 'N/A';
        return `${id.slice(0, 4)}${'*'.repeat(id.length - 4)}`;
    }

    // 신고자 이름 마스킹 함수
    function maskName(name) {
        if (!name) return 'N/A';
        if (name.length <= 2) return `${name[0]}${'*'.repeat(name.length - 1)}`;
        return `${name[0]}${'*'.repeat(name.length - 2)}${name[name.length - 1]}`;
    }
    
    return `
        <div class="danger-info">
            <div class="danger-header">
                <h4>신고 정보</h4>
                <span class="danger-status">${status}</span>
            </div>
            <div class="danger-content">
                <div class="reporter-info">
                    <div class="reporter-meta">
                        <span class="reporter-type">
                            ${reporter.reporter_type === 'SERVER' ? '서버' : '유저'} 신고
                        </span>
                        <span class="report-timestamp">${formatDate(reporter.timestamp) || 'N/A'}</span>
                    </div>
                    
                    <div class="report-type">
                        <span class="type-label">신고 유형</span>
                        <span class="type-value">${reporter.type || 'N/A'}</span>
                    </div>

                    ${reporter.description ? `
                        <div class="report-description">
                            <div class="description-content">${sanitizeHTML(reporter.description)}</div>
                        </div>
                    ` : ''}

                    ${reporter.evidence ? `
                        <div class="evidence-section">
                            <a href="/ntsa/data/evidence/${reporter.evidence}" 
                               target="_blank" 
                               class="evidence-link">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
                                </svg>
                                증거 자료 보기
                            </a>
                        </div>
                    ` : ''}
                </div>
            </div>
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
    console.log('Checking user:', userId, 'Active data:', state.activeData);
    return Boolean(state.activeData?.users?.[userId]?.reporter);
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

    // 기본 뷰 설정 - 서버 이름 업데이트
    const serverNameElement = clone.querySelector('.server-name');
    if (serverNameElement) {
        serverNameElement.textContent = state.serverData.server_name || 'Loading...';
    }

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
                newSearchInput.closest('.search-container')?.classList.add('search-focused');
            }, 0);
        }
    }

    // 카운트 업데이트
    const allCount = state.serverData.members.length;
    const dangerousCount = state.serverData.members.filter(m => {
        const isReported = isUserReported(m.id);
        console.log(`Member ${m.id} (${m.username}) reported status:`, isReported); // 디버깅
        return isReported;
    }).length;

    console.log('Total dangerous count:', dangerousCount); // 디버깅

    clone.querySelector('[data-view="all"] .count').textContent = `(${allCount})`;
    clone.querySelector('[data-view="dangerous"] .count').textContent = `(${dangerousCount})`;

    // 현재 뷰 표시
    const viewButtons = clone.querySelectorAll('.view-btn');
    viewButtons.forEach(btn => {
        if (btn.dataset.view === state.currentView) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // 페이지네이션 업데이트
    updatePagination(clone, totalPages);

    // DOM 업데이트
    serverView.innerHTML = '';
    serverView.appendChild(clone);

    // 카드 애니메이션
    requestAnimationFrame(() => {
        const cards = serverView.querySelectorAll('.member-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    });

    // 디버깅 정보 출력
    console.log('View updated:', {
        totalMembers: allCount,
        dangerousMembers: dangerousCount,
        currentView: state.currentView,
        searchQuery: state.searchQuery,
        currentPage: state.currentPage,
        totalPages: totalPages
    });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initializeMobileMenu();
    initializeMouseGradient();
    initializeSearch();  // Add the new initialization
    const urlParams = new URLSearchParams(window.location.search);
    const serverId = urlParams.get('server');

    console.log('Initial URL check - Server ID:', serverId);
    
    if (!serverId) {
        showError('스프레드시트 ID가 URL에 제공되지 않았습니다.');
        return;
    }
    
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
