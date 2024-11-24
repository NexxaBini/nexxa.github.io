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
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                card.style.background = `
                    radial-gradient(
                        circle at ${x}px ${y}px,
                        rgba(255, 3, 40, 0.1) 0%,
                        rgba(17, 17, 17, 0.7) 50%
                    )
                `;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.background = 'rgba(17, 17, 17, 0.7)';
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
