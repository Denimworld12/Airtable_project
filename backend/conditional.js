
export function shouldShowQuestion(rules, answersSoFar) {
    if (!rules) return true;
    const { logic = "AND", conditions = [] } = rules;
    function evalCondition(cond) {
        const { questionKey, operator, value } = cond;
        const answer = answersSoFar ? answersSoFar[questionKey] : undefined;

        const safeToString = (v) => (v === null || v === undefined ? "" : String(v));

        try {
            switch (operator) {
                case "equals":
                    return safeToString(answer) === safeToString(value);
                case "notEquals":
                    return safeToString(answer) !== safeToString(value);
                case "contains":
                    if (Array.isArray(answer)) {
                        return answer.includes(value);
                    }
                    return safeToString(answer).includes(safeToString(value));
                default:
                    return false;
            }
        } catch (e) {
            return false;
        }
    }

    const results = conditions.map(evalCondition);
    if (logic === "AND") return results.every(Boolean);
    return results.some(Boolean);
}
