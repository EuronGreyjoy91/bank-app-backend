class RepeatedAccountTypeError extends Error {
    constructor(message, errors) {
        super(message);
        this.status = 400;
        this.code = "REPEATED_ACCOUNT_TYPE_ERROR";
        this.errors = errors;
    }
}

module.exports = RepeatedAccountTypeError;