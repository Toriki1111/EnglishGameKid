class GameManager {
    constructor() {
        this.sceneManager = new SceneManager('game-container');
        this.stageRegistry = UnitMenu.buildStages();   // Pre-populate ALL stages (1 to 7)
        this.initScenes();
        this.bindEvents();
    }

    initScenes() {
        this.sceneManager.register('MainMenu',    new MainMenu());
        this.sceneManager.register('ChapterMenu', new ChapterMenu());
        this.sceneManager.register('UnitMenu',    new UnitMenu());
        this.sceneManager.register('BattleUI',    new BattleUI());

        this.sceneManager.switchTo('MainMenu');
    }

    bindEvents() {
        // Navigation
        window.events.on('PLAY_CLICKED', () => {
            this.sceneManager.switchTo('ChapterMenu');
        });

        window.events.on('CHAPTER_SELECTED', (chapterId) => {
            this.sceneManager.switchTo('UnitMenu', { chapterId });
        });

        // Start a stage
        window.events.on('STAGE_SELECTED', (stageData) => {
            this.stageRegistry[stageData.id] = stageData;
            this.sceneManager.switchTo('BattleUI', stageData);
        });

        // ── Post-battle navigation ──────────────────────────

        // Next Stage: directly loads the next stage into BattleUI
        window.events.on('GOTO_NEXT_STAGE', (nextStageId) => {
            const allStages = UnitMenu.buildStages();
            const nextStage = this.stageRegistry[nextStageId] || allStages[nextStageId];
            if (nextStage) {
                this.stageRegistry[nextStageId] = nextStage;
                this.sceneManager.switchTo('BattleUI', nextStage);
            } else {
                this.sceneManager.switchTo('UnitMenu');
            }
        });

        // Replay same stage (Game Over → Play Again)
        window.events.on('REPLAY_STAGE', (stageData) => {
            this.sceneManager.switchTo('BattleUI', stageData);
        });

        // Exit Stage button → go to Unit Menu
        window.events.on('EXIT_STAGE', () => {
            this.sceneManager.switchTo('UnitMenu');
        });

        // Main Menu from any result panel
        window.events.on('GOTO_MAIN_MENU', () => {
            this.sceneManager.switchTo('MainMenu');
        });
    }
}
