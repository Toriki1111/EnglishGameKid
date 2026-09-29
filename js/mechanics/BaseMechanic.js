class BaseMechanic {
    constructor(data, container) {
        this.data = data;
        this.container = container;
    }

    start() {
        // Override
    }

    destroy() {
        this.container.innerHTML = '';
    }

    emitCorrect() {
        window.events.emit('ANSWER_CORRECT');
    }

    emitWrong() {
        window.events.emit('ANSWER_WRONG');
    }
}
