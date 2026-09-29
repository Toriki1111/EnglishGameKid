/**
 * PlayerManager
 * Manages student profiles, authentication, stage stars (3-star system),
 * progress tracking, and local text backup/import.
 */
class PlayerManager {
    constructor() {
        this.STORAGE_KEY = 'english_quest_student_data';
        this.CURRENT_USER_KEY = 'english_quest_active_user_id';
        this.accounts = this._loadAccounts();
        this.currentPlayer = this._loadActivePlayer();
        
        // Ensure default player if none exists
        if (!this.currentPlayer && Object.keys(this.accounts).length === 0) {
            this.createAccount('Bé Khám Phá', 'Lớp 3A', '🦁');
        }
    }

    _loadAccounts() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error loading student accounts:', e);
            return {};
        }
    }

    _saveAccounts() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.accounts));
        } catch (e) {
            console.error('Error saving student accounts:', e);
        }
    }

    _loadActivePlayer() {
        const activeId = localStorage.getItem(this.CURRENT_USER_KEY);
        if (activeId && this.accounts[activeId]) {
            return this.accounts[activeId];
        }
        const ids = Object.keys(this.accounts);
        if (ids.length > 0) {
            return this.accounts[ids[0]];
        }
        return null;
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    getAllAccounts() {
        return Object.values(this.accounts);
    }

    createAccount(name, grade = 'Lớp 3', avatar = '🦁') {
        const id = 'student_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
        const newPlayer = {
            id: id,
            name: name.trim() || 'Học Sinh Mới',
            grade: grade.trim() || 'Lớp 3',
            avatar: avatar || '🦁',
            createdAt: new Date().toISOString(),
            stars: {}, // { stageId: starCount (1, 2, 3) }
            totalScore: 0
        };

        this.accounts[id] = newPlayer;
        this.currentPlayer = newPlayer;
        this._saveAccounts();
        localStorage.setItem(this.CURRENT_USER_KEY, id);
        
        window.events.emit('PLAYER_CHANGED', this.currentPlayer);
        return newPlayer;
    }

    login(accountId) {
        if (this.accounts[accountId]) {
            this.currentPlayer = this.accounts[accountId];
            localStorage.setItem(this.CURRENT_USER_KEY, accountId);
            window.events.emit('PLAYER_CHANGED', this.currentPlayer);
            return true;
        }
        return false;
    }

    deleteAccount(accountId) {
        if (this.accounts[accountId]) {
            delete this.accounts[accountId];
            this._saveAccounts();
            if (this.currentPlayer && this.currentPlayer.id === accountId) {
                const ids = Object.keys(this.accounts);
                if (ids.length > 0) {
                    this.login(ids[0]);
                } else {
                    this.createAccount('Bé Khám Phá', 'Lớp 3A', '🦁');
                }
            }
            return true;
        }
        return false;
    }

    /**
     * Save stars for a completed stage.
     * @param {number} stageId 
     * @param {number} stars (1, 2, or 3)
     */
    saveStageStars(stageId, stars) {
        if (!this.currentPlayer) return;
        const currentStars = this.currentPlayer.stars[stageId] || 0;
        if (stars > currentStars) {
            this.currentPlayer.stars[stageId] = stars;
            this._saveAccounts();
            window.events.emit('PLAYER_PROGRESS_UPDATED', this.currentPlayer);
        }
    }

    getStageStars(stageId) {
        if (!this.currentPlayer || !this.currentPlayer.stars) return 0;
        return this.currentPlayer.stars[stageId] || 0;
    }

    getTotalStars() {
        if (!this.currentPlayer || !this.currentPlayer.stars) return 0;
        return Object.values(this.currentPlayer.stars).reduce((sum, s) => sum + s, 0);
    }

    /**
     * Export all student profiles & progress to a backup .txt file
     */
    exportBackupTxt() {
        const backupData = {
            version: '1.0',
            exportedAt: new Date().toLocaleString(),
            accounts: this.accounts,
            activeUserId: this.currentPlayer ? this.currentPlayer.id : null
        };

        const jsonStr = JSON.stringify(backupData, null, 2);
        const blob = new Blob([jsonStr], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const studentName = this.currentPlayer ? this.currentPlayer.name.replace(/\s+/g, '_') : 'hoc_sinh';
        a.download = `EnglishQuest_TienTrinh_${studentName}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import student profiles from .txt backup file
     */
    importBackupTxt(fileContent) {
        try {
            const data = JSON.parse(fileContent);
            if (data && data.accounts) {
                this.accounts = Object.assign(this.accounts, data.accounts);
                this._saveAccounts();
                if (data.activeUserId && this.accounts[data.activeUserId]) {
                    this.login(data.activeUserId);
                } else {
                    const ids = Object.keys(this.accounts);
                    if (ids.length > 0) this.login(ids[0]);
                }
                return { success: true, count: Object.keys(data.accounts).length };
            }
            return { success: false, error: 'File dữ liệu không đúng định dạng!' };
        } catch (e) {
            return { success: false, error: 'Không thể đọc file: ' + e.message };
        }
    }
}

window.playerManager = new PlayerManager();
