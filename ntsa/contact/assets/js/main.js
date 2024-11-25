// Form 관련 기능
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    // 폼 제출 핸들링
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalBtnText = submitBtn.innerHTML;
            
            // 버튼 로딩 상태
            submitBtn.innerHTML = `
                <span>전송 중...</span>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2v4"></path>
                </svg>
            `;
            submitBtn.disabled = true;

            try {
                // 폼 데이터 수집
                const formData = {
                    name: document.getElementById('name').value,
                    email: document.getElementById('email').value,
                    subject: document.getElementById('subject').value,
                    message: document.getElementById('message').value
                };

                // 임시 지연 (실제 API 호출 대신)
                await new Promise(resolve => setTimeout(resolve, 1500));

                // 성공 메시지
                submitBtn.innerHTML = `
                    <span>전송 완료</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                `;
                submitBtn.style.backgroundColor = '#22c55e';

                // 폼 초기화
                contactForm.reset();

                // 3초 후 버튼 원래 상태로 복구
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }, 3000);

            } catch (error) {
                // 에러 처리
                submitBtn.innerHTML = `
                    <span>전송 실패</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                `;
                submitBtn.style.backgroundColor = '#ef4444';

                // 3초 후 버튼 원래 상태로 복구
                setTimeout(() => {
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                    submitBtn.style.backgroundColor = '';
                }, 3000);
            }
        });
    }

    // 폼 입력 필드 실시간 유효성 검사
    const inputs = contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateField(input);
        });

        input.addEventListener('blur', () => {
            validateField(input);
        });
    });

    function validateField(field) {
        // 필드가 비어있는지 확인
        if (field.value.trim() === '') {
            field.style.borderColor = '#ef4444';
            return false;
        }

        // 이메일 유효성 검사
        if (field.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value)) {
                field.style.borderColor = '#ef4444';
                return false;
            }
        }

        // 유효한 경우
        field.style.borderColor = '#22c55e';
        return true;
    }

    // 카드 호버 효과
    const cards = document.querySelectorAll('.contact-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `
                radial-gradient(
                    600px circle at ${x}px ${y}px,
                    rgba(255, 3, 40, 0.07),
                    rgba(17, 17, 17, 0.7) 40%
                )
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = 'rgba(17, 17, 17, 0.7)';
        });
    });

    // 스크롤 애니메이션
    const fadeInElements = document.querySelectorAll('.contact-card, .contact-form');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    fadeInElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.6s ease';
        observer.observe(element);
    });
});

// 네비게이션 바 스크롤 처리
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.remove('navbar-initial');
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.add('navbar-initial');
        navbar.classList.remove('navbar-scrolled');
    }
});

// 마우스 그라데이션 효과
let currentX = 70;
let currentY = 60;
let targetX = 70;
let targetY = 60;
let rafId = null;

function handleMouseGradient(e) {
    const mouseGradient = document.querySelector('.mouse-gradient');
    const baseX = 70;
    const baseY = 60;
    
    const mouseX = e.clientX / window.innerWidth * 100;
    const mouseY = e.clientY / window.innerHeight * 100;
    
    targetX = baseX + (mouseX - baseX) * 0.1;
    targetY = baseY + (mouseY - baseY) * 0.1;

    if (!rafId) {
        rafId = requestAnimationFrame(animate);
    }
}

function animate() {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    const mouseGradient = document.querySelector('.mouse-gradient');
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
