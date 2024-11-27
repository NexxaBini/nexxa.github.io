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
  
  // 기본 프로필 정보 설정
  const profileContent = `
      <div class="profile-banner" style="background-color: ${member.accentColor || '#000000'}"></div>
      <div class="profile-main">
          <div class="profile-avatar-wrapper">
              <img class="profile-avatar" src="${member.avatar || '/api/placeholder/96/96'}" alt="Profile Avatar">
              ${isUserDangerous(userId) ? '<span class="danger-indicator">위험</span>' : ''}
          </div>
          <div class="profile-header">
              <div class="profile-names">
                  <h3 class="profile-username">${member.username}</h3>
                  ${member.globalName ? `<span class="global-name">Global: ${member.globalName}</span>` : ''}
              </div>
              ${member.nickname ? `
                  <div class="server-nickname">
                      서버 별명: ${member.nickname}
                  </div>
              ` : ''}
          </div>
          <div class="profile-about">
              ${member.about ? `
                  <h4>소개</h4>
                  <p>${member.about}</p>
              ` : ''}
          </div>
          <div class="profile-roles">
              <h4>역할 (${member.roles?.length || 0})</h4>
              <div class="roles-grid">
                  ${member.roles && member.roles.length > 0 ? 
                      member.roles.map(role => `
                          <div class="role-badge" style="border-color: ${role.color || '#dcddde'}">
                              ${role.color ? `<span class="role-dot" style="background-color: ${role.color}"></span>` : ''}
                              ${role.name}
                          </div>
                      `).join('')
                      : '<div class="role-badge">역할 없음</div>'
                  }
              </div>
          </div>
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
  
  modalClone.querySelector('.modal-content').innerHTML = profileContent;
  
  // 위험 인물 정보가 있는 경우 추가 섹션 표시
  if (activeInfo) {
      const dangerSection = document.createElement('div');
      dangerSection.className = 'danger-info';
      
      // reporter 객체가 존재하고 필요한 데이터가 있는 경우에만 표시
      const reporterInfo = activeInfo.reporter && {
          name: activeInfo.reporter.reporter_name,
          type: activeInfo.reporter.type,
          timestamp: activeInfo.reporter.timestamp,
          description: activeInfo.reporter.description,
          evidence: activeInfo.reporter.evidence
      };
  
      dangerSection.innerHTML = `
          <div class="danger-header">
              <h4>위험 인물 정보</h4>
              <span class="danger-status ${activeInfo.target.status.toLowerCase()}">
                  ${activeInfo.target.status}
              </span>
          </div>
          <div class="danger-details">
              ${reporterInfo ? `
                  <div class="detail-item">
                      <span class="label">신고자</span>
                      <span class="value">${reporterInfo.name || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="label">신고 유형</span>
                      <span class="value">${reporterInfo.type || 'N/A'}</span>
                  </div>
                  <div class="detail-item">
                      <span class="label">신고 일시</span>
                      <span class="value">${formatDate(reporterInfo.timestamp) || 'N/A'}</span>
                  </div>
                  ${reporterInfo.description ? `
                      <div class="detail-item description">
                          <span class="label">설명</span>
                          <div class="value">${reporterInfo.description}</div>
                      </div>
                  ` : ''}
                  ${reporterInfo.evidence ? `
                      <div class="detail-item">
                          <span class="label">증거</span>
                          <a href="/data/evidence/${reporterInfo.evidence}" target="_blank" class="evidence-link">
                              증거 확인
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                              </svg>
                          </a>
                      </div>
                  ` : ''}
              ` : '<p>신고 정보가 없습니다.</p>'}
          </div>
      `;
      modalClone.querySelector('.modal-content').appendChild(dangerSection);
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
