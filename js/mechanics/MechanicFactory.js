class MechanicFactory {
    static create(type, data, container) {
        switch (type) {
            case 'quiz-battle':    return new QuizBattle(data, container);
            case 'match-image':   return new MatchImage(data, container);
            case 'match-word':    return new MatchWord(data, container);
            case 'fill-blank':    return new FillBlank(data, container);
            case 'connect-match': return new ConnectMatch(data, container);
            case 'boss-mixed':    return new BossMixed(data, container);
            default:
                console.error('Unknown mechanic type:', type);
                return null;
        }
    }
}

window.MechanicFactory = MechanicFactory;
