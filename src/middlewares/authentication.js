const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader)
        return 401;

    try {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_SECRET);

        return 200;
    } catch (error) {
        return 403;
    }

    return 401;
}

module.exports = authenticateJWT;