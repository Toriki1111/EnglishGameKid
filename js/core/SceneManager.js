class SceneManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scenes = {};
        this.currentScene = null;
    }

    register(name, sceneInstance) {
        this.scenes[name] = sceneInstance;
        this.container.appendChild(sceneInstance.getElement());
    }

    switchTo(name, data = null) {
        if (this.currentScene) {
            this.currentScene.hide();
        }
        
        const scene = this.scenes[name];
        if (scene) {
            scene.show(data);
            this.currentScene = scene;
        } else {
            console.error(`Scene ${name} not found!`);
        }
    }
}
