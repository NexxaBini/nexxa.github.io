function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-chip .number');
    
    numbers.forEach(numberElement => {
        const target = parseInt(numberElement.getAttribute('data-target'));
        const duration = 1000; // 1초로 단축
        const step = target / 50; // 50단계로 줄여서 더 빠르게
        const stepTime = duration / 50;
        let current = 0;
        
        const updateNumber = () => {
            current += step;
            if (current < target) {
                numberElement.textContent = Math.round(current) + '+';
                requestAnimationFrame(() => {
                    setTimeout(updateNumber, stepTime);
                });
            } else {
                numberElement.textContent = target + '+';
            }
        };
        
        updateNumber();
    });
}

// 스크롤 인디케이터 제어
function handleScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;

    const fadeOutPoint = window.innerHeight * 0.3; // 화면 높이의 30% 지점에서 페이드아웃 시작

    function updateScrollIndicator() {
        const scrollPosition = window.scrollY;
        
        if (scrollPosition > fadeOutPoint) {
            if (!scrollIndicator.classList.contains('hidden')) {
                scrollIndicator.classList.add('hidden');
            }
        } else {
            if (scrollIndicator.classList.contains('hidden')) {
                scrollIndicator.classList.remove('hidden');
            }
            
            // 스크롤 위치에 따른 opacity 계산
            const opacity = 1 - (scrollPosition / fadeOutPoint);
            scrollIndicator.style.opacity = opacity;
        }
    }

    // 초기 실행
    updateScrollIndicator();

    // 스크롤 이벤트 리스너 추가
    window.addEventListener('scroll', updateScrollIndicator);

    // 스크롤 인디케이터 클릭 시 부드러운 스크롤
    scrollIndicator.addEventListener('click', () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });
}

// About 페이지 전용 JavaScript
document.addEventListener('DOMContentLoaded', () => {
    initializeMissionCards();
    setTimeout(animateNumbers, 500);
    
    // Timeline 애니메이션
    function animateTimeline() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        timelineItems.forEach((item, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'translateY(0)';
                        }, index * 200);
                        observer.unobserve(item);
                    }
                });
            }, { threshold: 0.2 });

            // 초기 스타일 설정
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'all 0.6s ease';

            observer.observe(item);
        });
        
        handleScrollIndicator();
    }

    // Mission 카드 호버 효과
function initializeMissionCards() {
    const cards = document.querySelectorAll('.mission-card');
    
    cards.forEach(card => {
        // 각 카드마다 현재 위치와 목표 위치 저장
        let currentX = 0;
        let currentY = 0;
        let targetX = 0;
        let targetY = 0;
        let animationFrameId = null;

        function updateGradient() {
            // 부드러운 이동을 위한 보간
            const easing = 0.1; // 값이 작을수록 더 부드럽게 움직임
            
            currentX += (targetX - currentX) * easing;
            currentY += (targetY - currentY) * easing;
            
            // 현재 위치와 목표 위치의 차이가 매우 작으면 애니메이션 중지
            const dx = targetX - currentX;
            const dy = targetY - currentY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            card.style.background = `
                radial-gradient(
                    600px circle at ${currentX}px ${currentY}px,
                    rgba(255, 3, 40, 0.07),
                    rgba(17, 17, 17, 0.7) 40%
                )
            `;

            if (distance > 0.1) {
                animationFrameId = requestAnimationFrame(updateGradient);
            }
        }

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            targetX = e.clientX - rect.left;
            targetY = e.clientY - rect.top;
            
            // 애니메이션이 실행 중이 아니면 시작
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updateGradient);
            }
        });

        card.addEventListener('mouseleave', () => {
            // 마우스가 떠났을 때 그라데이션을 중앙으로 부드럽게 이동
            const rect = card.getBoundingClientRect();
            targetX = rect.width / 2;
            targetY = rect.height / 2;
            
            // 마지막 한 번의 애니메이션 실행
            if (!animationFrameId) {
                animationFrameId = requestAnimationFrame(updateGradient);
            }

            // 일정 시간 후 기본 배경으로 복귀
            setTimeout(() => {
                if (animationFrameId) {
                    cancelAnimationFrame(animationFrameId);
                    animationFrameId = null;
                }
                card.style.background = 'rgba(17, 17, 17, 0.7)';
            }, 300);
        });
    });
}

    // 헤더 텍스트 애니메이션
    function animateHeroText() {
        const heroContent = document.querySelector('.hero-content');
        heroContent.style.opacity = '0';
        heroContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            heroContent.style.transition = 'all 0.8s ease';
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Mission 카드 스크롤 애니메이션
    function animateMissionCards() {
        const cards = document.querySelectorAll('.mission-card');
        
        cards.forEach((card, index) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 200);
                        observer.unobserve(card);
                    }
                });
            }, { threshold: 0.2 });

            // 초기 스타일 설정
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s ease';

            observer.observe(card);
        });
    }

    // Section 제목 애니메이션
    function animateSectionTitles() {
        const titles = document.querySelectorAll('section h2');
        
        titles.forEach((title) => {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        title.style.opacity = '1';
                        title.style.transform = 'translateY(0)';
                        observer.unobserve(title);
                    }
                });
            }, { threshold: 0.5 });

            // 초기 스타일 설정
            title.style.opacity = '0';
            title.style.transform = 'translateY(20px)';
            title.style.transition = 'all 0.6s ease';

            observer.observe(title);
        });
    }

    // 모든 애니메이션 초기화
    function initializeAnimations() {
        animateHeroText();
        animateTimeline();
        animateMissionCards();
        animateSectionTitles();
        initializeMissionCards();
    }

    // 페이지 로드 시 애니메이션 시작
    initializeAnimations();
});
