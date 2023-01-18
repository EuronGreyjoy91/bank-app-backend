class RepeatedCardError extends Error {
    constructor(message, errors) {
        super(message);
        this.status = 400;
        this.code = "REPEATED_CARD_ERROR";
        this.errors = errors;
    }
}

module.exports = RepeatedCardError;