document.addEventListener('DOMContentLoaded', function() {
    // DOM 요소들
    var loadingScreen = document.querySelector('.loading-screen');
    var nav = document.querySelector('nav');
    var menuToggle = document.querySelector('.menu-toggle');
    var navLinks = document.querySelector('.nav-links');
    var hamburger = document.querySelector('.hamburger');

    // 로딩 화면 제거
    if (loadingScreen) {
        setTimeout(function() {
            loadingScreen.style.opacity = '0';
            setTimeout(function() {
                loadingScreen.style.display = 'none';
                startAnimations();
            }, 500);
        }, 1000);
    }

    // 시작 애니메이션
    function startAnimations() {
        var heroElements = document.querySelectorAll('.hero-content > *');
        heroElements.forEach(function(el, index) {
            setTimeout(function() {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    // 스크롤 이벤트
    window.addEventListener('scroll', function() {
        if (nav) {
            if (window.scrollY > 50) {
                nav.style.background = 'rgba(0, 0, 0, 0.95)';
            } else {
                nav.style.background = 'rgba(0, 0, 0, 0.9)';
            }
        }
    });

    // 모바일 메뉴
    if (menuToggle && navLinks && hamburger) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // 스무스 스크롤
    var anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
                // 모바일 메뉴 닫기
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
            }
        });
    });
});
