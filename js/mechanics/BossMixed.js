/**
 * BossMixed mechanic
 * Randomly cycles through multiple question types (quiz-battle, match-image, match-word, fill-blank).
 * Uses its own internal mini-renderers for each type.
 * Each question → ANSWER_CORRECT or ANSWER_WRONG.
 *
 * Data format:
 *   { questions: [ { type: 'quiz'|'image'|'word'|'blank', ...question fields... }, ... ] }
 */
class BossMixed extends BaseMechanic {
    constructor(data, container) {
        super(data, container);
        this.questions = Random.shuffle([...data.questions]);
        this.currentIndex = 0;
        this.isLocked = false;
        this.DELAY_MS = 1500;
    }

    start() { this.renderQuestion(); }

    renderQuestion() {
        if (this.destroyed) return;
        this.isLocked = false;

        if (this.currentIndex >= this.questions.length) {
            this.currentIndex = 0; // Loop until monster HP = 0
        }

        const q = this.questions[this.currentIndex];

        switch (q.type) {
            case 'quiz':   this.renderQuiz(q);  break;
            case 'image':  this.renderImage(q); break;
            case 'word':   this.renderWord(q);  break;
            case 'blank':  this.renderBlank(q); break;
            default:       this.renderQuiz(q);  break;
        }
    }

    // ── Quiz: question text + word options ──────────────────────────────────
    renderQuiz(q) {
        this.container.innerHTML = `
            <div class="boss-badge">&#128293; BOSS</div>
            <div class="question-text">${q.q}</div>
            <div class="options-grid">
                ${q.options.map(o => `<button class="option-btn">${o}</button>`).join('')}
            </div>
        `;
        this.bindOptionBtns(q.a);
    }

    // ── Match Image: show WORD → pick emoji ─────────────────────────────────
    renderImage(q) {
        this.container.innerHTML = `
            <div class="boss-badge">&#128293; BOSS</div>
            <div class="question-text">${q.word}</div>
            <div class="options-grid">
                ${q.options.map(o => `<button class="option-btn" style="font-size:36px;min-width:72px;padding:10px 14px;">${o}</button>`).join('')}
            </div>
        `;
        this.bindOptionBtns(q.a);
    }

    // ── Match Word: show EMOJI → pick word ──────────────────────────────────
    renderWord(q) {
        this.container.innerHTML = `
            <div class="boss-badge">&#128293; BOSS</div>
            <div class="question-text" style="font-size:60px;margin-bottom:4px;">${q.image}</div>
            <div class="options-grid">
                ${q.options.map(o => `<button class="option-btn">${o}</button>`).join('')}
            </div>
        `;
        this.bindOptionBtns(q.a);
    }

    // ── Fill Blank: sentence with ___ ────────────────────────────────────────
    renderBlank(q) {
        const display = q.sentence.replace('___',
            '<span style="color:#2196F3;font-weight:900;letter-spacing:2px;">___</span>');
        this.container.innerHTML = `
            <div class="boss-badge">&#128293; BOSS</div>
            <div class="question-text">${display}</div>
            <div class="options-grid">
                ${q.options.map(o => `<button class="option-btn">${o}</button>`).join('')}
            </div>
        `;
        this.bindOptionBtns(q.a);
    }

    // ── Shared answer binding ────────────────────────────────────────────────
    bindOptionBtns(answer) {
        this.container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                if (this.destroyed || this.isLocked) return;
                this.isLocked = true;

                if (e.currentTarget.textContent === answer) {
                    this.emitCorrect();
                    this.currentIndex++;
                    this.timeoutId = setTimeout(() => {
                        this.renderQuestion();
                    }, this.DELAY_MS);
                } else {
                    this.emitWrong();
                    this.timeoutId = setTimeout(() => {
                        this.isLocked = false;
                    }, this.DELAY_MS);
                }
            });
        });
    }

    destroy() {
        this.destroyed = true;
        this.isLocked = true;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        super.destroy();
    }
}
