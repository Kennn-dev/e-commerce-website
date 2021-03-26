require("dotenv").config();
const jwt = require("jsonwebtoken");

const jwtAuth = async (req, res, next) => {
  y;
  const tokenFromRequest = await req.headers.authorization;

  if (tokenFromRequest) {
    //verify token
    try {
      const token = tokenFromRequest.replace("Bearer ", "");
      const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN);

      //save info token then next()
      req.user = verifiedToken;
      next();
    } catch (error) {
      //not valid token

      res.status(401);
      res.send({ error: "Unauthorized 🔐" });
    }
  } else {
    //not have token
    res.status(403).send({ error: "Who are you ??? 🤔" });
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
