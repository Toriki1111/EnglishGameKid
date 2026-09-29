class Random {
    static int(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Crucial for Monster HP business rule
    static multipleOf(min, max, multiple) {
        const minValue = Math.ceil(min / multiple);
        const maxValue = Math.floor(max / multiple);
        const value = this.int(minValue, maxValue);
        return value * multiple;
    }

    static choice(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    }

    static shuffle(array) {
        const result = [...array];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }
}

window.Random = Random;
