/**
 * ChapterLinkedList
 * A Doubly Linked List data structure designed to store, traverse,
 * and query game Chapters and their stages for Admin HP configuration.
 */

class ChapterNode {
    constructor(id, title, description, stages = []) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.stages = stages; // Array of { id, name, monster, isBoss, defaultHp, currentHp }
        this.next = null;
        this.prev = null;
    }
}

class ChapterLinkedList {
    constructor() {
        this.head = null;
        this.tail = null;
        this.size = 0;
        this.STORAGE_KEY = 'english_quest_custom_hp';
    }

    /**
     * Append a new Chapter node to the end of the Linked List
     */
    append(id, title, description, stages) {
        // Load custom HP overrides if saved
        const savedHp = this.loadSavedHpConfig();
        const processedStages = stages.map(s => {
            const currentHp = (savedHp && savedHp[s.id] !== undefined) 
                ? parseInt(savedHp[s.id]) 
                : s.defaultHp;
            return Object.assign({}, s, { currentHp });
        });

        const newNode = new ChapterNode(id, title, description, processedStages);

        if (!this.head) {
            this.head = newNode;
            this.tail = newNode;
        } else {
            this.tail.next = newNode;
            newNode.prev = this.tail;
            this.tail = newNode;
        }
        this.size++;
        return newNode;
    }

    /**
     * Query a chapter node by ID using Linked List traversal
     * @param {number|string} chapterId 
     * @returns {ChapterNode|null}
     */
    find(chapterId) {
        let current = this.head;
        const targetId = parseInt(chapterId);

        while (current) {
            if (parseInt(current.id) === targetId) {
                return current;
            }
            current = current.next;
        }
        return null;
    }

    /**
     * Traverse all chapter nodes from head to tail
     * @param {function} callback(node, index)
     */
    traverse(callback) {
        let current = this.head;
        let index = 0;
        while (current) {
            callback(current, index);
            current = current.next;
            index++;
        }
    }

    /**
     * Convert Linked List to flat Array of chapters
     * @returns {Array<ChapterNode>}
     */
    toArray() {
        const result = [];
        this.traverse(node => result.push(node));
        return result;
    }

    /**
     * Update monster HP for a specific stage inside a chapter
     * @param {number|string} chapterId 
     * @param {number|string} stageId 
     * @param {number} newHp 
     */
    updateStageHp(chapterId, stageId, newHp) {
        const chapterNode = this.find(chapterId);
        if (!chapterNode) return { success: false, error: 'Chapter không tồn tại!' };

        const targetStageId = parseInt(stageId);
        const stage = chapterNode.stages.find(s => parseInt(s.id) === targetStageId);
        if (!stage) return { success: false, error: 'Stage không tồn tại!' };

        // Validate HP (must be positive integer, recommended multiple of 20)
        const parsedHp = Math.max(20, Math.min(2000, parseInt(newHp) || stage.defaultHp));
        stage.currentHp = parsedHp;

        // Persist all custom HP across chapters into localStorage
        this.saveAllHpConfig();
        return { success: true, stage, updatedHp: parsedHp };
    }

    /**
     * Reset stage HPs of a chapter back to default values
     * @param {number|string} chapterId 
     */
    resetChapterDefaults(chapterId) {
        const chapterNode = this.find(chapterId);
        if (!chapterNode) return false;

        chapterNode.stages.forEach(s => {
            s.currentHp = s.defaultHp;
        });

        this.saveAllHpConfig();
        return true;
    }

    /**
     * Load custom HP mapping from localStorage
     */
    loadSavedHpConfig() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (e) {
            console.error('Error reading custom HP config:', e);
            return {};
        }
    }

    /**
     * Save current HP mapping across all Linked List nodes to localStorage
     */
    saveAllHpConfig() {
        try {
            const configMap = {};
            this.traverse(node => {
                node.stages.forEach(stage => {
                    configMap[stage.id] = stage.currentHp;
                });
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(configMap));
            return configMap;
        } catch (e) {
            console.error('Error saving custom HP config:', e);
            return null;
        }
    }
}

// Expose globally
if (typeof window !== 'undefined') {
    window.ChapterNode = ChapterNode;
    window.ChapterLinkedList = ChapterLinkedList;
}
