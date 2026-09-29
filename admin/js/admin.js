/**
 * Admin Panel Controller
 * Uses ChapterLinkedList to traverse and query chapters,
 * and allows real-time modification of monster and boss HP.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 0. Password Protection (1010)
    if (sessionStorage.getItem('admin_auth_1010') !== 'true') {
        const pass = prompt('🔒 BẢO MẬT ADMIN: Vui lòng nhập mật khẩu quản trị viên:');
        if (pass === '1010') {
            sessionStorage.setItem('admin_auth_1010', 'true');
        } else {
            alert('Mật khẩu không chính xác! Đang quay lại trang trò chơi...');
            window.location.href = '../index.html';
            return;
        }
    }

    // 1. Initialize Linked List
    const chapterList = new ChapterLinkedList();

    // Chapter 1 Stages
    const chapter1Stages = [
        { id: 1, name: 'Stage 1 — Match Image',   mechanic: 'match-image',   monster: 'Shoebill',   isBoss: false, defaultHp: 100 },
        { id: 2, name: 'Stage 2 — Match Word',    mechanic: 'match-word',    monster: 'Shoebill',   isBoss: false, defaultHp: 100 },
        { id: 3, name: 'Stage 3 — Fill Blank',    mechanic: 'fill-blank',    monster: 'Shoebill',   isBoss: false, defaultHp: 100 },
        { id: 4, name: 'Stage 4 — Quiz Battle',   mechanic: 'quiz-battle',   monster: 'Shoebill',   isBoss: false, defaultHp: 100 },
        { id: 5, name: 'Stage 5 — Nối Từ',        mechanic: 'connect-match', monster: 'Shoebill',   isBoss: false, defaultHp: 100 },
        { id: 6, name: 'Stage 6 — Nối Hình',      mechanic: 'connect-match', monster: 'Shoebill',   isBoss: false, defaultHp: 100 },
        { id: 7, name: 'Stage 7 — BOSS Rhino',    mechanic: 'boss-mixed',    monster: 'Rhino Boss', isBoss: true,  defaultHp: 200 }
    ];

    // Chapter 2 Stages (Expansion)
    const chapter2Stages = [
        { id: 8,  name: 'Stage 1 — Riverside Words', mechanic: 'match-image',   monster: 'Frog',       isBoss: false, defaultHp: 120 },
        { id: 9,  name: 'Stage 2 — River Animals',   mechanic: 'match-word',    monster: 'Frog',       isBoss: false, defaultHp: 120 },
        { id: 10, name: 'Stage 3 — Riverside Blank', mechanic: 'fill-blank',    monster: 'Beaver',     isBoss: false, defaultHp: 140 },
        { id: 11, name: 'Stage 4 — River Battle',    mechanic: 'quiz-battle',   monster: 'Beaver',     isBoss: false, defaultHp: 140 },
        { id: 12, name: 'Stage 5 — River Pairs',     mechanic: 'connect-match', monster: 'Beaver',     isBoss: false, defaultHp: 140 },
        { id: 13, name: 'Stage 6 — BOSS Beaver King',mechanic: 'boss-mixed',    monster: 'Beaver King',isBoss: true,  defaultHp: 300 }
    ];

    // Populate Linked List nodes
    chapterList.append(1, 'Chương 1: Forest of Words', 'Khu rừng từ vựng cơ bản (Unit 1 - Animals)', chapter1Stages);
    chapterList.append(2, 'Chương 2: Riverside Adventures', 'Dòng sông phiêu lưu (Unit 2 - Nature)', chapter2Stages);

    // State
    let selectedChapterId = 1;

    // DOM Elements
    const chapterNavList = document.getElementById('chapter-nav-list');
    const linkedListVisual = document.getElementById('linked-list-visual');
    const chapterTitleEl = document.getElementById('selected-chapter-title');
    const chapterDescEl = document.getElementById('selected-chapter-desc');
    const stagesContainer = document.getElementById('stages-container');
    const toastEl = document.getElementById('toast-notification');
    const btnResetChapter = document.getElementById('btn-reset-chapter');
    const btnSaveAll = document.getElementById('btn-save-all');

    // ─── RENDER SIDEBAR & LINKED LIST VISUALIZATION ──────────────────────────

    function renderChapterNavigation() {
        chapterNavList.innerHTML = '';
        linkedListVisual.innerHTML = '';

        // Traverse using Linked List
        chapterList.traverse((node, index) => {
            const isSelected = node.id === selectedChapterId;

            // 1. Sidebar Nav item
            const navBtn = document.createElement('button');
            navBtn.className = `chapter-nav-btn ${isSelected ? 'active' : ''}`;
            navBtn.innerHTML = `
                <div class="nav-btn-icon">${node.id === 1 ? '🌿' : '🌊'}</div>
                <div class="nav-btn-text">
                    <span class="nav-btn-title">Chapter ${node.id}</span>
                    <span class="nav-btn-sub">${node.title}</span>
                </div>
            `;
            navBtn.addEventListener('click', () => selectChapter(node.id));
            chapterNavList.appendChild(navBtn);

            // 2. Linked List visual node
            const nodeBadge = document.createElement('div');
            nodeBadge.className = `ll-node ${isSelected ? 'active' : ''}`;
            nodeBadge.innerHTML = `
                <span class="ll-node-label">Node [ID: ${node.id}]</span>
                <span class="ll-node-name">${node.title}</span>
                <span class="ll-node-stages">${node.stages.length} Stages</span>
            `;
            nodeBadge.addEventListener('click', () => selectChapter(node.id));
            linkedListVisual.appendChild(nodeBadge);

            // Arrow pointer to next node in Linked List
            if (node.next) {
                const arrow = document.createElement('div');
                arrow.className = 'll-arrow';
                arrow.innerHTML = '⇄';
                arrow.title = 'Doubly Linked (next / prev)';
                linkedListVisual.appendChild(arrow);
            }
        });
    }

    // ─── SELECT CHAPTER & RENDER STAGES ──────────────────────────────────────

    function selectChapter(chapterId) {
        selectedChapterId = parseInt(chapterId);
        renderChapterNavigation();
        renderStages();
    }

    function renderStages() {
        // Query node using ChapterLinkedList.find(id)
        const chapterNode = chapterList.find(selectedChapterId);
        if (!chapterNode) return;

        chapterTitleEl.textContent = chapterNode.title;
        chapterDescEl.textContent = chapterNode.description;
        stagesContainer.innerHTML = '';

        chapterNode.stages.forEach(stage => {
            const card = document.createElement('div');
            card.className = `stage-admin-card ${stage.isBoss ? 'boss-card' : ''}`;

            const questionsCount = Math.round(stage.currentHp / 20);

            card.innerHTML = `
                <div class="stage-card-header">
                    <div class="stage-info">
                        <span class="stage-badge ${stage.isBoss ? 'boss-badge' : 'normal-badge'}">
                            ${stage.isBoss ? '🔥 BOSS STAGE' : 'STAGE ' + stage.id}
                        </span>
                        <h3 class="stage-name">${stage.name}</h3>
                        <span class="monster-tag">👾 Quái vật: <strong>${stage.monster}</strong></span>
                    </div>
                    <div class="stage-hp-display">
                        <span class="hp-label">MÁU (HP) HIỆN TẠI</span>
                        <span class="hp-value-badge" id="hp-badge-${stage.id}">${stage.currentHp} HP</span>
                    </div>
                </div>

                <div class="stage-card-body">
                    <div class="hp-control-group">
                        <label>Chỉnh sửa HP quái vật:</label>
                        <div class="hp-input-row">
                            <button type="button" class="btn-step btn-minus" data-stage-id="${stage.id}">-20</button>
                            <input type="number" 
                                   class="hp-number-input" 
                                   id="input-hp-${stage.id}" 
                                   value="${stage.currentHp}" 
                                   min="20" 
                                   max="2000" 
                                   step="20" />
                            <button type="button" class="btn-step btn-plus" data-stage-id="${stage.id}">+20</button>
                        </div>
                    </div>

                    <div class="stage-stats-preview">
                        <span class="preview-item">
                            ⚡ Sát thương/câu đúng: <strong>20 DMG</strong>
                        </span>
                        <span class="preview-item" id="req-hits-${stage.id}">
                            🎯 Cần trả lời đúng: <strong>${questionsCount} câu</strong> để hạ gục
                        </span>
                        <span class="preview-item default-text">
                            (Mặc định: ${stage.defaultHp} HP)
                        </span>
                    </div>
                </div>
            `;

            // Bind inputs & buttons
            const input = card.querySelector(`#input-hp-${stage.id}`);
            const btnMinus = card.querySelector('.btn-minus');
            const btnPlus = card.querySelector('.btn-plus');

            input.addEventListener('change', () => {
                applyHpChange(stage.id, input.value);
            });

            btnMinus.addEventListener('click', () => {
                const currentVal = parseInt(input.value) || stage.defaultHp;
                const newVal = Math.max(20, currentVal - 20);
                input.value = newVal;
                applyHpChange(stage.id, newVal);
            });

            btnPlus.addEventListener('click', () => {
                const currentVal = parseInt(input.value) || stage.defaultHp;
                const newVal = Math.min(2000, currentVal + 20);
                input.value = newVal;
                applyHpChange(stage.id, newVal);
            });

            stagesContainer.appendChild(card);
        });
    }

    function applyHpChange(stageId, newHp) {
        const result = chapterList.updateStageHp(selectedChapterId, stageId, newHp);
        if (result.success) {
            // Update UI elements instantly
            const badge = document.getElementById(`hp-badge-${stageId}`);
            const reqHits = document.getElementById(`req-hits-${stageId}`);
            if (badge) badge.textContent = `${result.updatedHp} HP`;
            if (reqHits) {
                const questionsCount = Math.round(result.updatedHp / 20);
                reqHits.innerHTML = `🎯 Cần trả lời đúng: <strong>${questionsCount} câu</strong> để hạ gục`;
            }
            showToast(`✓ Đã lưu Stage ${stageId}: ${result.updatedHp} HP vào cấu hình!`);
        }
    }

    // ─── RESET & EXPORT ──────────────────────────────────────────────────────

    btnResetChapter.addEventListener('click', () => {
        if (confirm(`Bạn có chắc muốn khôi phục HP mặc định cho tất cả các màn trong Chapter ${selectedChapterId}?`)) {
            chapterList.resetChapterDefaults(selectedChapterId);
            renderStages();
            showToast(`✓ Đã khôi phục HP mặc định cho Chapter ${selectedChapterId}!`);
        }
    });

    btnSaveAll.addEventListener('click', () => {
        chapterList.saveAllHpConfig();
        showToast('✓ Toàn bộ cấu hình máu quái đã được áp dụng vào Game!');
    });

    function showToast(message) {
        toastEl.textContent = message;
        toastEl.classList.remove('show');
        void toastEl.offsetWidth;
        toastEl.classList.add('show');
        setTimeout(() => toastEl.classList.remove('show'), 2500);
    }

    // Initial render
    renderChapterNavigation();
    renderStages();
});
