/**
 * AccountModal
 * Modal UI for student login, registration, profile switching,
 * and .txt backup export/import.
 */
class AccountModal {
    constructor() {
        this.element = document.createElement('div');
        this.element.id = 'account-modal-overlay';
        this.element.className = 'modal-overlay';
        this.activeTab = 'list'; // 'list' | 'create' | 'backup'
        this.selectedAvatar = '🦁';
        this.avatars = ['🦁', '🐯', '🐼', '🦊', '🐶', '🐱', '🦄', '🦸', '🧙', '🚀', '🌟', '🏆'];
        
        this.render();
        if (document.body) {
            document.body.appendChild(this.element);
        } else {
            window.addEventListener('DOMContentLoaded', () => document.body.appendChild(this.element));
        }
    }

    render() {
        const player = window.playerManager.getCurrentPlayer();
        const accounts = window.playerManager.getAllAccounts();

        this.element.innerHTML = `
            <div class="modal-card">
                <!-- MODAL HEADER -->
                <div class="modal-header">
                    <h2 class="modal-title">&#127891; Tài Khoản Học Sinh</h2>
                    <button class="modal-close-btn" id="modal-close-x">&#x2715;</button>
                </div>

                <!-- TABS -->
                <div class="modal-tabs">
                    <button class="modal-tab ${this.activeTab === 'list' ? 'active' : ''}" data-tab="list">
                        Danh Sách (${accounts.length})
                    </button>
                    <button class="modal-tab ${this.activeTab === 'create' ? 'active' : ''}" data-tab="create">
                        + Tạo Tài Khoản
                    </button>
                    <button class="modal-tab ${this.activeTab === 'backup' ? 'active' : ''}" data-tab="backup">
                        &#128190; Sao Lưu / Nạp File
                    </button>
                </div>

                <!-- MODAL BODY -->
                <div class="modal-body" id="modal-tab-content">
                    ${this.renderTabContent(player, accounts)}
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderTabContent(currentPlayer, accounts) {
        if (this.activeTab === 'list') {
            if (accounts.length === 0) {
                return `
                    <div class="empty-list-msg">
                        <p>Chưa có tài khoản nào được lưu.</p>
                        <button class="btn btn-primary" id="btn-goto-create">+ Tạo Tài Khoản Học Sinh Mới</button>
                    </div>
                `;
            }

            return `
                <div class="account-list">
                    ${accounts.map(acc => {
                        const isCurrent = currentPlayer && currentPlayer.id === acc.id;
                        const totalStars = Object.values(acc.stars || {}).reduce((s, c) => s + c, 0);
                        return `
                            <div class="account-item ${isCurrent ? 'current-active' : ''}">
                                <div class="account-avatar">${acc.avatar || '🦁'}</div>
                                <div class="account-info">
                                    <div class="account-name">
                                        ${acc.name}
                                        ${isCurrent ? '<span class="badge-active">&#10004; Đang dùng</span>' : ''}
                                    </div>
                                    <div class="account-sub">
                                        <span>${acc.grade || 'Lớp 3'}</span> &bull; 
                                        <span class="account-stars">&#11088; ${totalStars} Sao</span>
                                    </div>
                                </div>
                                <div class="account-actions">
                                    ${!isCurrent ? `<button class="btn-sm btn-select-account" data-id="${acc.id}">Chọn</button>` : ''}
                                    <button class="btn-sm btn-delete-account" data-id="${acc.id}" title="Xóa tài khoản">&#128465;</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }

        if (this.activeTab === 'create') {
            return `
                <form class="create-account-form" id="create-account-form">
                    <div class="form-group">
                        <label>Tên học sinh:</label>
                        <input type="text" id="input-student-name" class="form-input" placeholder="Ví dụ: Nguyễn Văn An" maxlength="25" required autofocus />
                    </div>

                    <div class="form-group">
                        <label>Lớp học:</label>
                        <select id="input-student-grade" class="form-input">
                            <option value="Lớp 3A">Lớp 3A</option>
                            <option value="Lớp 3B">Lớp 3B</option>
                            <option value="Lớp 3C">Lớp 3C</option>
                            <option value="Lớp 3D">Lớp 3D</option>
                            <option value="Lớp 3E">Lớp 3E</option>
                            <option value="Khác">Lớp khác</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Chọn Avatar đại diện:</label>
                        <div class="avatar-picker">
                            ${this.avatars.map(av => `
                                <button type="button" class="avatar-opt ${this.selectedAvatar === av ? 'selected' : ''}" data-avatar="${av}">
                                    ${av}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-top: 10px;">
                        &#10024; Tạo Tài Khoản & Vào Chơi
                    </button>
                </form>
            `;
        }

        if (this.activeTab === 'backup') {
            return `
                <div class="backup-section">
                    <div class="backup-card">
                        <h3>&#128229; Xuất file tiến trình (.txt)</h3>
                        <p>Lưu toàn bộ danh sách học sinh và số sao đạt được ra file văn bản txt để sao lưu hoặc chuyển máy.</p>
                        <button class="btn btn-secondary" id="btn-export-txt">&#128190; Tải File .txt Về Máy</button>
                    </div>

                    <div class="backup-card">
                        <h3>&#128228; Nạp file tiến trình (.txt)</h3>
                        <p>Khôi phục lại dữ liệu học sinh từ file sao lưu đã tải trước đó.</p>
                        <input type="file" id="input-import-file" accept=".txt,.json" style="display: none;" />
                        <button class="btn btn-secondary" id="btn-trigger-import">&#128194; Chọn File .txt Để Nạp</button>
                        <div id="import-status-msg" style="margin-top: 8px; font-weight: bold;"></div>
                    </div>
                </div>
            `;
        }

        return '';
    }

    bindEvents() {
        // Close modal
        this.element.querySelector('#modal-close-x').addEventListener('click', () => this.hide());
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) this.hide();
        });

        // Switch Tabs
        this.element.querySelectorAll('.modal-tab').forEach(tabBtn => {
            tabBtn.addEventListener('click', (e) => {
                this.activeTab = e.currentTarget.dataset.tab;
                this.render();
            });
        });

        // Tab: List actions
        const gotoCreateBtn = this.element.querySelector('#btn-goto-create');
        if (gotoCreateBtn) {
            gotoCreateBtn.addEventListener('click', () => {
                this.activeTab = 'create';
                this.render();
            });
        }

        this.element.querySelectorAll('.btn-select-account').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                window.playerManager.login(id);
                this.render();
            });
        });

        this.element.querySelectorAll('.btn-delete-account').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                if (confirm('Bạn có chắc muốn xóa tài khoản này và tiến trình đi kèm?')) {
                    window.playerManager.deleteAccount(id);
                    this.render();
                }
            });
        });

        // Tab: Create Form
        const createForm = this.element.querySelector('#create-account-form');
        if (createForm) {
            createForm.querySelectorAll('.avatar-opt').forEach(avBtn => {
                avBtn.addEventListener('click', (e) => {
                    this.selectedAvatar = e.currentTarget.dataset.avatar;
                    createForm.querySelectorAll('.avatar-opt').forEach(b => b.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                });
            });

            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = this.element.querySelector('#input-student-name').value;
                const grade = this.element.querySelector('#input-student-grade').value;
                window.playerManager.createAccount(name, grade, this.selectedAvatar);
                this.activeTab = 'list';
                this.render();
            });
        }

        // Tab: Backup
        const exportBtn = this.element.querySelector('#btn-export-txt');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                window.playerManager.exportBackupTxt();
            });
        }

        const importTrigger = this.element.querySelector('#btn-trigger-import');
        const fileInput = this.element.querySelector('#input-import-file');
        if (importTrigger && fileInput) {
            importTrigger.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                    const result = window.playerManager.importBackupTxt(event.target.result);
                    const statusEl = this.element.querySelector('#import-status-msg');
                    if (result.success) {
                        statusEl.style.color = '#4CAF50';
                        statusEl.textContent = `✓ Đã nạp thành công ${result.count} tài khoản!`;
                        setTimeout(() => {
                            this.activeTab = 'list';
                            this.render();
                        }, 1200);
                    } else {
                        statusEl.style.color = '#F44336';
                        statusEl.textContent = '✗ ' + result.error;
                    }
                };
                reader.readAsText(file);
            });
        }
    }

    show() {
        this.render();
        this.element.classList.add('active');
    }

    hide() {
        this.element.classList.remove('active');
    }
}

window.accountModal = new AccountModal();
