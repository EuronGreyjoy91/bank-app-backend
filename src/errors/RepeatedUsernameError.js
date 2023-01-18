class RepeatedUsernameError extends Error {
    constructor(message, errors) {
        super(message);
        this.status = 400;
        this.code = "REPEATED_USERNAME_ERROR";
        this.errors = errors;
    }
}

module.exports = RepeatedUsernameError;