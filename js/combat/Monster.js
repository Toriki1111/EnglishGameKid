class Monster {
    constructor(stageData) {
        const stageId = stageData ? stageData.id : null;
        const customHpMap = Monster.getCustomHpMap();

        // Check if Admin configured custom HP for this stage
        if (stageId && customHpMap && customHpMap[stageId] !== undefined) {
            this.maxHp = Math.max(20, parseInt(customHpMap[stageId]));
        } else if (stageData && stageData.isBoss) {
            this.maxHp = 200;
        } else {
            this.maxHp = 100;
        }

        this.currentHp = this.maxHp;
    }

    static getCustomHpMap() {
        try {
            const data = localStorage.getItem('english_quest_custom_hp');
            return data ? JSON.parse(data) : {};
        } catch (e) {
            return {};
        }
    }

    takeDamage(amount) {
        this.currentHp -= amount;
        if (this.currentHp < 0) this.currentHp = 0;

        const pct = (this.currentHp / this.maxHp) * 100;
        window.events.emit('MONSTER_HP_CHANGED', {
            pct: pct,
            current: this.currentHp,
            max: this.maxHp
        });

        if (this.currentHp === 0) {
            window.events.emit('MONSTER_DEFEATED');
        }
    }
}
