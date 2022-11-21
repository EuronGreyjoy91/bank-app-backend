class CustomError extends Error {
    constructor(message) {
        super(message);
        this.status = 401;
        this.code = "CUSTOM_ERROR";
    }
}

module.exports = CustomError;