// Sample user data array
const sampleUsers = [
    {
        tag: "User#1234",
        id: "123456789",
        joinDate: "2023-01-15",
        servers: 15,
        ip: "192.168.1.1",
        status: "주의 대상"
    },
    {
        tag: "User#5678",
        id: "987654321",
        joinDate: "2023-03-20",
        servers: 8,
        ip: "192.168.1.2",
        status: "위험"
    },
    {
        tag: "User#9012",
        id: "456789123",
        joinDate: "2023-06-10",
        servers: 23,
        ip: "192.168.1.3",
        status: "관찰 필요"
    }
];

// Function to create user card HTML
function createUserCard(user) {
    return `
        <div class="user-card">
            <h3>${user.tag}</h3>
            <div class="user-info">ID: ${user.id}</div>
            <div class="user-info">가입일: ${user.joinDate}</div>
            <div class="user-info">서버: ${user.servers}개</div>
            <div class="user-info">IP: ${user.ip}</div>
            <div class="status">${user.status}</div>
        </div>
    `;
}

// Function to initialize user list
function initializeUserList() {
    const userList = document.getElementById('userList');
    if (userList) {
        userList.innerHTML = sampleUsers.map(user => createUserCard(user)).join('');
    }
}

// Function to handle search
function handleSearch() {
    const searchInput = document.getElementById('searchInput');
    const userList = document.getElementById('userList');
    
    if (!searchInput || !userList) return;

    const searchTerm = searchInput.value.toLowerCase();
    const filteredUsers = sampleUsers.filter(user => 
        user.tag.toLowerCase().includes(searchTerm) || 
        user.id.includes(searchTerm)
    );
    
    userList.innerHTML = filteredUsers.map(user => createUserCard(user)).join('');

    // Add animation to new cards
    const cards = document.querySelectorAll('.user-card');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        requestAnimationFrame(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize user list when page loads
    initializeUserList();

    // Add search button click event
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }

    // Add search input enter key event
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });

        // Add search input real-time search (optional)
        searchInput.addEventListener('input', () => {
            // Debounce the search to prevent too many updates
            clearTimeout(searchInput.debounceTimeout);
            searchInput.debounceTimeout = setTimeout(handleSearch, 300);
        });
    }
});

// Add error handling
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
});
