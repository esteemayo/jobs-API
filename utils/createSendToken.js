const createSendToken = (user, statusCode, req, res) => {
  const token = user.generateAuthToken();

  res.cookie('jwtToken', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
    path: '/',
  });

  // remove password from output
  const { password, role, ...rest } = user._doc;

  const details = {
    token,
    ...rest,
  }

  res.status(statusCode).json({
    status: 'success',
    token,
    ...user._doc,
  });
};

export default createSendToken;
