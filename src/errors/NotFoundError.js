class NotFoundError extends Error {
    constructor(message, errors) {
        super(message);
        this.status = 404;
        this.code = "NOT_FOUND_ERROR";
        this.errors = errors;
    }
}

module.exports = NotFoundError;