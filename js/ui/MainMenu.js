class MainMenu {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'scene';
        this.element.id = 'scene-main-menu';
        this.element.style.background = 'linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%)';
        this.render();
        this.bindEvents();
    }

    render() {
        const player = window.playerManager ? window.playerManager.getCurrentPlayer() : null;
        const totalStars = window.playerManager ? window.playerManager.getTotalStars() : 0;
        const maxStars = 7 * 3; // 7 stages * 3 stars

        this.element.innerHTML = `
            <!-- TOP PLAYER PROFILE BAR (TOP LEFT) -->
            <div class="main-menu-player-bar">
                <div class="player-pill" id="btn-open-account">
                    <span class="player-pill-avatar">${player ? player.avatar : '🦁'}</span>
                    <div class="player-pill-text">
                        <span class="player-pill-name">${player ? player.name : 'Bé Khám Phá'}</span>
                        <span class="player-pill-grade">${player ? player.grade : 'Lớp 3'}</span>
                    </div>
                    <div class="player-pill-stars">
                        <span class="star-icon">&#11088;</span>
                        <span class="star-count">${totalStars}/${maxStars}</span>
                    </div>
                </div>
            </div>

            <!-- TOP ADMIN BUTTON (TOP RIGHT) -->
            <div class="main-menu-admin-bar">
                <button class="admin-pill-btn" id="btn-admin-top">
                    &#9881; Admin
                </button>
            </div>

            <!-- MAIN CONTENT -->
            <div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px;z-index:1;">
                <h1 style="
                    font-size: 54px;
                    color: #FFD700;
                    text-shadow: 0 0 40px #FFD70066, 0 3px 6px rgba(0,0,0,0.9);
                    letter-spacing: 4px;
                    margin: 0 0 4px 0;
                    text-align: center;
                ">ENGLISH QUEST</h1>
                <p style="color:#88aacc;font-size:16px;letter-spacing:2px;margin: 0 0 28px 0;">Learn English. Defeat Monsters.</p>
                
                <button class="btn btn-main-play" id="btn-play">&#9654; VÀO CHƠI</button>
                <button class="btn" id="btn-login" style="background:linear-gradient(180deg,#FFC107,#F57F17);border-color:#E65100;">
                    &#127891; TÀI KHOẢN
                </button>
                <button class="btn" id="btn-settings" style="background:linear-gradient(180deg,#607D8B,#37474F);border-color:#263238;">
                    &#9881; CÀI ĐẶT
                </button>
            </div>
        `;

        this.element.querySelector('#btn-play').addEventListener('click', () => {
            window.events.emit('PLAY_CLICKED');
        });
        this.element.querySelector('#btn-login').addEventListener('click', () => {
            if (window.accountModal) window.accountModal.show();
        });
        this.element.querySelector('#btn-open-account').addEventListener('click', () => {
            if (window.accountModal) window.accountModal.show();
        });
        this.element.querySelector('#btn-settings').addEventListener('click', () => {
            alert('Cài đặt âm thanh và đồ họa sẽ ra mắt trong giai đoạn tiếp theo!');
        });

        // Top-right Admin button with password protection (1010)
        this.element.querySelector('#btn-admin-top').addEventListener('click', () => {
            const pass = prompt('🔒 Vui lòng nhập mật khẩu Quản trị viên (Admin):');
            if (pass === '1010') {
                sessionStorage.setItem('admin_auth_1010', 'true');
                window.location.href = 'admin/index.html';
            } else if (pass !== null) {
                alert('Mật khẩu không chính xác!');
            }
        });
    }

    bindEvents() {
        window.events.on('PLAYER_CHANGED', () => this.render());
        window.events.on('PLAYER_PROGRESS_UPDATED', () => this.render());
    }

    getElement() { return this.element; }
    show() {
        this.render();
        this.element.classList.add('active');
    }
    hide() { this.element.classList.remove('active'); }
}
