class CombatManager {
    constructor() {
        this.monster = null;
        this.DAMAGE_PER_CORRECT = 20;

        window.events.on('ANSWER_CORRECT', () => {
            this.handleAttack();
        });
    }

    initBattle(stageData) {
        this.monster = new Monster(stageData);
        // Emit full HP info
        window.events.emit('MONSTER_HP_CHANGED', {
            pct: 100,
            current: this.monster.currentHp,
            max: this.monster.maxHp
        });
    }

    handleAttack() {
        if (!this.monster) return;
        this.monster.takeDamage(this.DAMAGE_PER_CORRECT);
    }
}
