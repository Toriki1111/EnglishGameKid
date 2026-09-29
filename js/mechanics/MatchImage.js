class MatchImage extends BaseMechanic {
    constructor(data, container) {
        super(data, container);
        this.currentQuestionIndex = 0;
        this.questions = Random.shuffle(this.data.questions);
        this.isLocked = false;
        this.DELAY_MS = 1500;
    }

    start() { this.renderQuestion(); }

    renderQuestion() {
        if (this.destroyed) return;
        this.isLocked = false;

        if (this.currentQuestionIndex >= this.questions.length) {
            this.currentQuestionIndex = 0;
        }
        const q = this.questions[this.currentQuestionIndex];

        this.container.innerHTML = `
            <div class="question-text">${q.word}</div>
            <div class="options-grid">
                ${q.options.map(opt =>
                    `<button class="option-btn" style="font-size:36px;min-width:80px;padding:12px 16px;">${opt}</button>`
                ).join('')}
            </div>
        `;

        this.container.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (this.destroyed || this.isLocked) return;
                this.isLocked = true;

                if (e.currentTarget.textContent === q.a) {
                    this.emitCorrect();
                    this.currentQuestionIndex++;
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
