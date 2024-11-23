// GSAP 초기화
gsap.registerPlugin(ScrollTrigger);

// 로딩 화면
window.addEventListener('load', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    gsap.to(loadingScreen, {
        opacity: 0,
        duration: 1,
        onComplete: () => {
            loadingScreen.style.display = 'none';
            // 히어로 섹션 애니메이션
            animateHeroSection();
        }
    });
});

// 히어로 섹션 애니메이션
function animateHeroSection() {
    const heroElements = document.querySelectorAll('.hero-content > *');
    gsap.fromTo(heroElements, 
        {
