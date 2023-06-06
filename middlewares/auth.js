const jwt = require("jsonwebtoken");

require('dotenv').config();

const auth=(req,res,next)=>{
    let token = req.headers.authorization.split(" ")[1];
    if (!token) {
        return res.status(404).send("Please Login First,Token not found")
    }
    jwt.verify(token, process.env.key, function (err, decoded) {
        if (err) {
            return res.status(404).send("Not Authorised");
        } else {
            let userID=decoded.userID;
            req.body.userID = userID;
            next();
        }
    });
}

module.exports={auth}