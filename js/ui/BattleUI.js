class BattleUI {
    constructor() {
        this.element = document.createElement('div');
        this.element.className = 'scene';
        this.element.id = 'scene-battle';
        this.combatManager = new CombatManager();
        this.currentMechanic = null;
        this.currentStageData = null;
        this.playerHp = 100;
        this.maxPlayerHp = 100;
        this.battleOver = false;
        this.mobSprite = null;
        this.playerSprite = null;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;

        this.render();
        this.bindEvents();
    }

    // ─── RENDER ──────────────────────────────────────────────────────────────

    render() {
        this.element.innerHTML = `
            <div class="battle-screen">

                <!-- TOP BAR -->
                <div class="battle-topbar">
                    <div id="stage-label" class="stage-label">Stage 1</div>
                    <button class="btn-exit" id="btn-exit-stage">&#x2715; Thoát</button>
                </div>

                <!-- ARENA -->
                <div class="arena">

                    <!-- PLAYER SIDE -->
                    <div class="fighter player-side">
                        <div class="fighter-name" id="player-fighter-name">Hero</div>
                        <div class="hp-bar-wrap">
                            <div class="hp-bar-bg">
                                <div class="hp-bar-fill" id="player-hp-fill"></div>
                            </div>
                            <span class="hp-label" id="player-hp-label">100</span>
                        </div>
                        <div class="sprite-frame" id="player-frame">
                            <div id="player-canvas-wrap"></div>
                        </div>
                    </div>

                    <!-- CENTER -->
                    <div class="arena-center">
                        <div class="vs-badge">VS</div>
                    </div>

                    <!-- MONSTER SIDE -->
                    <div class="fighter monster-side">
                        <div class="fighter-name" id="monster-name">Monster</div>
                        <div class="hp-bar-wrap">
                            <div class="hp-bar-bg">
                                <div class="hp-bar-fill" id="monster-hp-fill"></div>
                            </div>
                            <span class="hp-label" id="monster-hp-label">100</span>
                        </div>
                        <div class="sprite-frame monster-canvas-wrap" id="monster-frame">
                            <div id="monster-canvas-wrap"></div>
                        </div>
                    </div>

                </div>

                <!-- POPUPS -->
                <div class="popup-layer">
                    <div class="dmg-popup" id="dmg-popup-monster"></div>
                    <div class="dmg-popup player-dmg" id="dmg-popup-player"></div>
                    <div class="feedback-banner" id="feedback-banner"></div>
                </div>

                <!-- MECHANIC PANEL -->
                <div class="mechanic-panel" id="mechanic-container"></div>

            </div>
        `;

        this.element.querySelector('#btn-exit-stage').addEventListener('click', () => this.exitStage());
    }

    // ─── EVENTS ──────────────────────────────────────────────────────────────

    bindEvents() {
        window.events.on('MONSTER_HP_CHANGED', ({ pct, current }) => {
            const fill = this.element.querySelector('#monster-hp-fill');
            const label = this.element.querySelector('#monster-hp-label');
            fill.style.width = pct + '%';
            label.textContent = current;
            if (pct > 60) fill.style.background = '#4CAF50';
            else if (pct > 30) fill.style.background = '#FFC107';
            else fill.style.background = '#F44336';
        });

        window.events.on('ANSWER_CORRECT', () => {
            if (this.battleOver) return;
            this.correctAnswers++;
            this.showFeedback('Great!', '#4CAF50');
            this.showDamagePopup('monster', '-20');
            this.animatePlayerAttack();
        });

        window.events.on('ANSWER_WRONG', () => {
            if (this.battleOver) return;
            this.wrongAnswers++;
            this.showFeedback('Try again!', '#FFC107');
            this.showDamagePopup('player', '-10');
            this.damagePlayer(10);
            this.animateMonsterAttack();
        });

        window.events.on('MONSTER_DEFEATED', () => {
            if (this.battleOver) return;
            this.battleOver = true;
            if (this.currentMechanic) this.currentMechanic.destroy();
            if (this.mobSprite) {
                this.mobSprite.dead(() => this.showVictoryPanel());
            } else {
                this.showVictoryPanel();
            }
        });
    }

    // ─── SPRITE ANIMATIONS ───────────────────────────────────────────────────

    animatePlayerAttack() {
        const playerFrame = this.element.querySelector('#player-frame');
        playerFrame.classList.add('lunge-right');
        if (this.playerSprite) this.playerSprite.attack();
        setTimeout(() => {
            playerFrame.classList.remove('lunge-right');
            if (this.mobSprite) this.mobSprite.hit();
        }, 200);
    }

    animateMonsterAttack() {
        const playerFrame = this.element.querySelector('#player-frame');
        const monsterFrame = this.element.querySelector('#monster-frame');
        if (this.mobSprite) this.mobSprite.attack();
        monsterFrame.classList.add('lunge-left');
        setTimeout(() => {
            monsterFrame.classList.remove('lunge-left');
            playerFrame.classList.add('hit-shake');
            setTimeout(() => playerFrame.classList.remove('hit-shake'), 400);
        }, 200);
    }

    // ─── 3-STAR CALCULATION & VICTORY PANEL ─────────────────────────────────

    calculateStars() {
        // Star 1 = 33.33%, Star 2 = 66.66%, Star 3 = 100%
        // Perfect (0 wrong) -> 3 stars (100%)
        // 1-2 wrong -> 2 stars (~66.7%)
        // > 2 wrong -> 1 star (~33.3%)
        let stars = 3;
        let percentage = '100%';
        let gradeText = 'Xuất Sắc! (100%)';

        if (this.wrongAnswers === 0) {
            stars = 3;
            percentage = '100%';
            gradeText = '⭐ 3 Sao Hoàn Hảo! (100%)';
        } else if (this.wrongAnswers <= 2) {
            stars = 2;
            percentage = '66.7%';
            gradeText = '⭐ 2 Sao - Giỏi Lắm! (66.7%)';
        } else {
            stars = 1;
            percentage = '33.3%';
            gradeText = '⭐ 1 Sao - Cố Lên Nhé! (33.3%)';
        }

        // Save progress to current student account
        if (window.playerManager && this.currentStageData) {
            window.playerManager.saveStageStars(this.currentStageData.id, stars);
        }

        return { stars, percentage, gradeText };
    }

    showVictoryPanel() {
        this.showFeedback('VICTORY!', '#FFD700');
        const isBoss = this.currentStageData && this.currentStageData.isBoss;
        const hasNext = this.currentStageData && this.currentStageData.nextStageId != null;
        const { stars, gradeText } = this.calculateStars();

        let starsHtml = '<div class="victory-stars-container">';
        for (let i = 1; i <= 3; i++) {
            if (i <= stars) {
                starsHtml += `<span class="victory-star filled" style="animation-delay: ${i * 0.2}s">&#9733;</span>`;
            } else {
                starsHtml += `<span class="victory-star empty">&#9734;</span>`;
            }
        }
        starsHtml += '</div>';

        const nextBtn = (!isBoss && hasNext)
            ? `<button class="panel-btn btn-next" id="btn-next-stage">Next Stage &#8594;</button>`
            : '';
        const title = isBoss ? '🔥 BOSS DEFEATED!' : '🎉 Stage Clear!';

        const panel = this.element.querySelector('#mechanic-container');
        panel.innerHTML = `
            <div class="result-panel">
                <h2 class="result-title" style="color:#FFD700; font-size: 26px;">${title}</h2>
                ${starsHtml}
                <p class="result-grade-sub" style="color:#81C784; font-weight: bold; font-size: 17px; margin: 4px 0 10px 0;">
                    ${gradeText}
                </p>
                <div class="result-btns">
                    ${nextBtn}
                    <button class="panel-btn btn-secondary-nav" id="btn-victory-stages">Chọn Màn</button>
                    <button class="panel-btn btn-menu" id="btn-victory-menu">Menu Chính</button>
                </div>
            </div>
        `;

        if (!isBoss && hasNext) {
            const nextBtnEl = panel.querySelector('#btn-next-stage');
            nextBtnEl.addEventListener('click', () => {
                nextBtnEl.disabled = true;
                window.events.emit('GOTO_NEXT_STAGE', this.currentStageData.nextStageId);
            });
        }
        const vicStagesBtn = panel.querySelector('#btn-victory-stages');
        if (vicStagesBtn) {
            vicStagesBtn.addEventListener('click', () => {
                vicStagesBtn.disabled = true;
                window.events.emit('EXIT_STAGE');
            });
        }
        const vicMenuBtn = panel.querySelector('#btn-victory-menu');
        vicMenuBtn.addEventListener('click', () => {
            vicMenuBtn.disabled = true;
            window.events.emit('GOTO_MAIN_MENU');
        });
    }

    showGameOverPanel() {
        this.battleOver = true;
        if (this.currentMechanic) this.currentMechanic.destroy();
        this.showFeedback('DEFEATED...', '#F44336');

        const panel = this.element.querySelector('#mechanic-container');
        panel.innerHTML = `
            <div class="result-panel">
                <div class="result-emoji">&#128128;</div>
                <h2 class="result-title" style="color:#F44336;">Game Over</h2>
                <p class="result-sub">Đừng bỏ cuộc! Hãy thử lại nhé!</p>
                <div class="result-btns">
                    <button class="panel-btn btn-next" id="btn-play-again">&#8635; Chơi Lại</button>
                    <button class="panel-btn btn-secondary-nav" id="btn-gameover-stages">Chọn Màn</button>
                    <button class="panel-btn btn-menu" id="btn-gameover-menu">Menu Chính</button>
                </div>
            </div>
        `;
        const playAgainBtn = panel.querySelector('#btn-play-again');
        playAgainBtn.addEventListener('click', () => {
            playAgainBtn.disabled = true;
            window.events.emit('REPLAY_STAGE', this.currentStageData);
        });
        const goStagesBtn = panel.querySelector('#btn-gameover-stages');
        if (goStagesBtn) {
            goStagesBtn.addEventListener('click', () => {
                goStagesBtn.disabled = true;
                window.events.emit('EXIT_STAGE');
            });
        }
        const goMenuBtn = panel.querySelector('#btn-gameover-menu');
        goMenuBtn.addEventListener('click', () => {
            goMenuBtn.disabled = true;
            window.events.emit('GOTO_MAIN_MENU');
        });
    }

    // ─── PLAYER HP ───────────────────────────────────────────────────────────

    damagePlayer(amount) {
        this.playerHp = Math.max(0, this.playerHp - amount);
        const pct = (this.playerHp / this.maxPlayerHp) * 100;
        const fill = this.element.querySelector('#player-hp-fill');
        const label = this.element.querySelector('#player-hp-label');
        fill.style.width = pct + '%';
        label.textContent = this.playerHp;
        if (pct > 60) fill.style.background = '#4CAF50';
        else if (pct > 30) fill.style.background = '#FFC107';
        else fill.style.background = '#F44336';

        if (this.playerHp <= 0) {
            setTimeout(() => this.showGameOverPanel(), 600);
        }
    }

    // ─── POPUPS / FEEDBACK ────────────────────────────────────────────────────

    showDamagePopup(target, text) {
        const id = target === 'monster' ? 'dmg-popup-monster' : 'dmg-popup-player';
        const el = this.element.querySelector('#' + id);
        el.textContent = text;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 900);
    }

    showFeedback(text, color) {
        const el = this.element.querySelector('#feedback-banner');
        el.textContent = text;
        el.style.color = color;
        el.classList.remove('show');
        void el.offsetWidth;
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 1200);
    }

    exitStage() {
        if (this.currentMechanic) this.currentMechanic.destroy();
        if (this.mobSprite) { this.mobSprite.destroy(); this.mobSprite = null; }
        if (this.playerSprite) { this.playerSprite.destroy(); this.playerSprite = null; }
        this.battleOver = true;
        window.events.emit('EXIT_STAGE');
    }

    // ─── LIFECYCLE ───────────────────────────────────────────────────────────

    start(stageData) {
        this.currentStageData = stageData;
        this.battleOver = false;
        this.correctAnswers = 0;
        this.wrongAnswers = 0;

        // Reset player HP
        this.playerHp = this.maxPlayerHp;
        const pFill = this.element.querySelector('#player-hp-fill');
        pFill.style.width = '100%';
        pFill.style.background = '#4CAF50';
        this.element.querySelector('#player-hp-label').textContent = this.maxPlayerHp;

        // Update player fighter name from active student profile
        const activePlayer = window.playerManager ? window.playerManager.getCurrentPlayer() : null;
        const playerNameEl = this.element.querySelector('#player-fighter-name');
        if (playerNameEl) {
            playerNameEl.textContent = activePlayer ? activePlayer.name : 'Hero';
        }

        // Init monster
        this.combatManager.initBattle(stageData);
        const monster = this.combatManager.monster;
        const mFill = this.element.querySelector('#monster-hp-fill');
        mFill.style.width = '100%';
        mFill.style.background = '#4CAF50';
        this.element.querySelector('#monster-hp-label').textContent = monster.maxHp;

        // Stage label
        const lblText = stageData.isBoss
            ? `\uD83D\uDD25 BOSS: ${stageData.name || 'Boss'}`
            : `Stage ${stageData.id}`;
        this.element.querySelector('#stage-label').textContent = lblText;

        // ── Load mob and player sprites ──────────────────────────
        if (this.mobSprite) { this.mobSprite.destroy(); this.mobSprite = null; }
        if (this.playerSprite) { this.playerSprite.destroy(); this.playerSprite = null; }

        const monsterWrap = this.element.querySelector('#monster-canvas-wrap');
        const playerWrap = this.element.querySelector('#player-canvas-wrap');
        const mobKey = stageData.isBoss ? 'rhino' : 'shoebill';
        const configs = typeof MOB_CONFIGS !== 'undefined' ? MOB_CONFIGS : null;

        if (configs) {
            this.mobSprite = new MobSprite(monsterWrap, configs[mobKey]);
            this.playerSprite = new MobSprite(playerWrap, configs['player']);
            this.element.querySelector('#monster-name').textContent = configs[mobKey].name;
        }

        // ── Spawn mechanic ───────────────────────────────────────
        const container = this.element.querySelector('#mechanic-container');
        container.innerHTML = '';
        if (this.currentMechanic) this.currentMechanic.destroy();
        this.currentMechanic = MechanicFactory.create(stageData.mechanic, stageData, container);
        this.currentMechanic.start();
    }

    getElement() { return this.element; }

    show(data) {
        this.element.classList.add('active');
        if (data) this.start(data);
    }

    hide() {
        this.element.classList.remove('active');
        if (this.currentMechanic) this.currentMechanic.destroy();
        if (this.mobSprite) { this.mobSprite.destroy(); this.mobSprite = null; }
        if (this.playerSprite) { this.playerSprite.destroy(); this.playerSprite = null; }
    }
}
