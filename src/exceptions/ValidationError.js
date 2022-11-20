class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.status = 400;
        this.code = "VALIDATION_ERROR";
    }
}

module.exports = ValidationError;