const jwt = require('jsonwebtoken');

const middlewareVerify = {
    verifyToken: (req, res, next) => {
        const authHeader = req.headers.token;
        if (authHeader) {
            const token = authHeader.split(" ")[1];
            jwt.verify(token, process.env.SECREC_KEY, (err, user) => {
                if (err) {
                    return res.status(403).json("Token không tồn tại hoặc đã hết hạn!");
                }
                req.user = user;
                next();
            });
        } else {
            return res.status(401).json("Hãy đăng nhập để thực hiện chức năng này");
        }
    },
    verifyTokenAndAdmin: (req, res, next) => {
        middlewareVerify.verifyToken(req, res, () => {

            if (req.user.admin || req.user.id === req.params.id) {
                next();
            } else {
                res.status(403).json("Bạn không có quyền này!")
            }
        }
        )
    },
    verifyTokenAdmin: (req, res, next) => {
        middlewareVerify.verifyToken(req, res, () => {
            if (req.user.admin) {
                next();
            } else {
                res.status(403).json("Bạn không có quyền này!")
            }
        })
    }



}

module.exports = middlewareVerify;