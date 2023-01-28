class InvalidAmountError extends Error {
    constructor(message, errors) {
        super(message);
        this.status = 400;
        this.code = "INVALID_AMOUNT_ERROR";
        this.errors = errors;
    }
}

module.exports = InvalidAmountError;