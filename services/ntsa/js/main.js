// GSAP 초기화
gsap.registerPlugin(ScrollTrigger);

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    
    // 로딩 화면 제거 및 히어로 섹션 애니메이션 시작
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                animateHeroSection();
            }, 500);
        }
    }, 1000);
});

// 히어로 섹션 애니메이션
function animateHeroSection() {
    const heroElements = document.querySelectorAll('.hero-content > *');
    gsap.fromTo(heroElements, 
        {
            opacity: 0,
            y: 30
        },
        {
            opacity: 1,
            y: 0,
            duration: 1,
            stagger: 0.2
        }
    );
}

// 스크롤 애니메이션
function initScrollAnimations() {
    // About 섹션 아이템 애니메이션
    gsap.utils.toArray('.about-item').forEach((item, index) => {
        gsap.fromTo(item,
            {
                opacity: 0,
                y: 50
            },
            {
                scrollTrigger: {
                    trigger: item,
                    start: "top 80%",
                },
                opacity: 1,
                y: 0,
                duration: 1,
                delay: index * 0.2
            }
        );
    });

    // 서비스 카드 애니메이션
    gsap.utils.toArray('.service-card').forEach((card, index) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 50
            },
            {
                scrollTrigger: {
                    trigger: card,
                    start: "top 80%",
                },
                opacity: 1,
                y: 0,
                duration: 1,
                delay: index * 0.2
            }
        );
    });

    // 컨택트 폼 애니메이션
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        gsap.fromTo(contactForm,
            {
                opacity: 0,
                y: 50
            },
            {
                scrollTrigger: {
                    trigger: contactForm,
                    start: "top 80%",
                },
                opacity: 1,
                y: 0,
                duration: 1
            }
        );
    }
}

// 네비게이션 스크롤 효과
window.addEventListener('scroll', () => {
    const nav = document.querySelector('nav');
    if (nav) {
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            nav.style.background = 'rgba(0, 0, 0, 0.9)';
        }
    }
});

// 모바일 메뉴 토글
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');

if (menuToggle && navLinks && hamburger) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
    });
}

// 스무스 스크롤
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // 모바일 메뉴가 열려있다면 닫기
            if (navLinks && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                hamburger.classList.remove('active');
            }
        }
    });
});

// 스크롤 애니메이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
});
