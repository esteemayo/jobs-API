const createSendToken = (user, statusCode, req, res) => {
  const token = user.generateAuthToken();

  res.cookie('jwtToken', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: true,
    signed: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    ...user._doc,
  });
};

module.exports = createSendToken;
