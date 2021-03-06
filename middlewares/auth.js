require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtAuth = async (req, res, next) => {
  const tokenFromRequest = await req.headers.authorization;
  // console.log(tokenFromRequest);
  if (tokenFromRequest) {
    //verify token
    try {
      const token = tokenFromRequest.replace("Bearer ", "");
      const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

      //save info token then next()
      // console.log(verifiedToken);
      req.user = verifiedToken; //object
      next();
    } catch (error) {
      //not valid token

      // res.status(401);
      res.send({ error: "Unauthorized 🔐" });
    }
  } else {
    //not have token
    res.send({ error: "Who are you ??? 🤔" });
  }
};

const getNewAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

    const newAccessToken = jwt.sign(decoded, process.env.ACCESS_TOKEN, {
      expiresIn: "1h",
    });
    return newAccessToken;
  } catch (error) {
    return null;
  }
};

module.exports = {
  jwtAuth: jwtAuth,
  getNewAccessToken: getNewAccessToken,
};
