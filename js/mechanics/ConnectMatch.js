/**
 * ConnectMatch mechanic
 * Shows two columns — left & right items — player clicks one side then the other to connect them.
 * Each correct pair  → ANSWER_CORRECT
 * Each wrong attempt → ANSWER_WRONG
 * All pairs matched  → done (monster dies via accumulated damage)
 *
 * Data format:
 *   { pairs: [{ left: "CAT", right: "🐱" }, ...], leftLabel: "WORDS", rightLabel: "IMAGES" }
 */
class ConnectMatch extends BaseMechanic {
    constructor(data, container) {
        super(data, container);
        this.pairs    = Random.shuffle([...data.pairs]);          // shuffle pair order
        this.lefts    = this.pairs.map(p => p.left);             // ordered left items
        this.rights   = Random.shuffle(this.pairs.map(p => p.right)); // shuffle right independently
        this.selected = null;   // { side: 'left'|'right', index, value, el }
        this.matched  = {};     // leftValue -> rightValue (confirmed pairs)
        this.isLocked = false;
        this.DELAY_MS = 1500;
    }

    start() {
        this.render();
    }

    render() {
        this.isLocked = false;
        this.container.innerHTML = `
            <div class="cm-header">
                <span class="cm-col-label">${this.data.leftLabel || 'WORDS'}</span>
                <span class="cm-col-label">${this.data.rightLabel || 'IMAGES'}</span>
            </div>
            <div class="cm-arena">
                <!-- Left column -->
                <div class="cm-col cm-left" id="cm-col-left">
                    ${this.lefts.map((v, i) =>
                        `<button class="cm-item cm-item-left" data-side="left" data-index="${i}" data-value="${v}">${v}</button>`
                    ).join('')}
                </div>

                <!-- Right column -->
                <div class="cm-col cm-right" id="cm-col-right">
                    ${this.rights.map((v, i) =>
                        `<button class="cm-item cm-item-right" data-side="right" data-index="${i}" data-value="${v}">${v}</button>`
                    ).join('')}
                </div>
            </div>
        `;

        // Bind click on every item
        this.container.querySelectorAll('.cm-item').forEach(el => {
            el.addEventListener('click', e => this.onItemClick(e.currentTarget));
        });
    }

    onItemClick(el) {
        if (this.destroyed || this.isLocked) return;
        const side  = el.dataset.side;
        const value = el.dataset.value;

        // Already matched — ignore
        if (el.classList.contains('cm-matched')) return;

        // If nothing selected yet
        if (!this.selected) {
            // Must start from left side
            if (side !== 'left') {
                el.classList.add('cm-wrong-flash');
                setTimeout(() => el.classList.remove('cm-wrong-flash'), 500);
                return;
            }
            this.selected = { side, value, el };
            el.classList.add('cm-selected');
            return;
        }

        // Something already selected
        if (side === 'left') {
            // Re-select left side
            this.selected.el.classList.remove('cm-selected');
            this.selected = { side, value, el };
            el.classList.add('cm-selected');
            return;
        }

        // Right side clicked — attempt a match
        const leftVal  = this.selected.value;
        const rightVal = value;
        const leftEl   = this.selected.el;
        const rightEl  = el;

        this.selected.el.classList.remove('cm-selected');
        this.selected = null;
        this.isLocked = true;

        // Check correctness: find the pair where left = leftVal → its right should = rightVal
        const correctPair = this.pairs.find(p => p.left === leftVal);
        if (correctPair && correctPair.right === rightVal) {
            // CORRECT: Highlight both matched buttons as green
            leftEl.classList.add('cm-matched');
            rightEl.classList.add('cm-matched');
            this.matched[leftVal] = rightVal;
            this.emitCorrect();

            // Check if all pairs done
            if (Object.keys(this.matched).length === this.pairs.length) {
                this.container.querySelectorAll('.cm-item').forEach(e => e.disabled = true);
            } else {
                this.timeoutId = setTimeout(() => {
                    this.isLocked = false;
                }, this.DELAY_MS);
            }
        } else {
            // WRONG: Flash red
            leftEl.classList.add('cm-wrong-flash');
            rightEl.classList.add('cm-wrong-flash');
            this.emitWrong();

            this.timeoutId = setTimeout(() => {
                leftEl.classList.remove('cm-wrong-flash');
                rightEl.classList.remove('cm-wrong-flash');
                this.isLocked = false;
            }, this.DELAY_MS);
        }
    }

    destroy() {
        this.destroyed = true;
        this.isLocked = true;
        if (this.timeoutId) clearTimeout(this.timeoutId);
        super.destroy();
    }
}
