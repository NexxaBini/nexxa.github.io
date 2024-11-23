/* 히어로 섹션 요소들의 기본 상태 */
.hero-content > * {
    opacity: 0;
    transform: translateY(30px);
    transition: opacity 0.5s ease, transform 0.5s ease;
}

/* 로딩 화면 */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    transition: opacity 0.5s ease;
}

.loader {
    width: 50px;
    height: 50px;
    border: 3px solid #fff;
    border-radius: 50%;
    border-top-color: #ff3333;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* 모바일 메뉴 */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    .nav-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.95);
        padding: 1rem;
    }
    
    .nav-links.active li {
        margin: 1rem 0;
    }
}
