const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    try {
        const token = req.headers.authorization;
        jwt.verify(token, 'hello_world');
        next(); 
    } catch (err) {
        res.status(401).json({
            message: `Token auth failed: ${err.message}`
        });
    }
}