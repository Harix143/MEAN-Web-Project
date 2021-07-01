const jwt = require('jsonwebtoken');

module.exports.verifyJwtToken = (req, res, next) => {
    var token;
    if ('authorization' in req.headers)
        token = req.headers['authorization'].split(' ')[1];

    if (!token)
        return res.status(403).send({ auth: false, message: 'No token provided.' });
    else {
        jwt.verify(token, "secret-of-roy",
            (err, decoded) => {
                if (err)
                    return res.status(500).send({ auth: false, message: 'Token authentication failed.' });
                else if(decoded.role != 'parent'){
                    return res.status(500).send({ auth: false, message: 'You do not have permission to perform this action' });
                }
                else{
                    req._id = decoded._id;
                    next();
                }
            }
        )
    }
}