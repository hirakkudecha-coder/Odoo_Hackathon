import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = () => {
  return jwt.sign({}, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Support single common credential for any role without database modification
    let user;
    if (email === 'transitops@common.com' && password === 'password123') {
      const requestedRole = req.body.role || 'Fleet Manager';
      user = await User.findOne({ role: requestedRole });
      if (!user || user.status === 'inactive') {
        return res.status(401).json({ success: false, message: `No active user found with role ${requestedRole}` });
      }
    } else {
      user = await User.findOne({ email });
      if (!user || user.status === 'inactive') {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    // Hash refresh token to store in database (simple hash)
    const tokenHash = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET); // Using JWT itself as a hash variant
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Clean expired tokens and add new one
    user.refreshTokens = user.refreshTokens.filter(t => t.expiresAt > new Date());
    user.refreshTokens.push({ tokenHash, expiresAt });
    await user.save();

    // Set cookie
    res.cookie('refreshToken', tokenHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const tokenHash = req.cookies.refreshToken;
    if (!tokenHash) {
      return res.status(401).json({ success: false, message: 'Refresh token missing' });
    }

    // Find user with this token
    const user = await User.findOne({ 
      'refreshTokens.tokenHash': tokenHash,
      status: 'active'
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });
    }

    // Verify token expiry
    const tokenObj = user.refreshTokens.find(t => t.tokenHash === tokenHash);
    if (!tokenObj || tokenObj.expiresAt < new Date()) {
      // Remove it
      user.refreshTokens = user.refreshTokens.filter(t => t.tokenHash !== tokenHash);
      await user.save();
      return res.status(401).json({ success: false, message: 'Expired refresh token' });
    }

    // Rotate refresh token
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken();
    const newTokenHash = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Replace the old token hash with the new one
    user.refreshTokens = user.refreshTokens.filter(t => t.tokenHash !== tokenHash);
    user.refreshTokens.push({ tokenHash: newTokenHash, expiresAt });
    await user.save();

    res.cookie('refreshToken', newTokenHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const tokenHash = req.cookies.refreshToken;
    if (tokenHash && req.user) {
      req.user.refreshTokens = req.user.refreshTokens.filter(t => t.tokenHash !== tokenHash);
      await req.user.save();
    }
    
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, status: 'active' });
    if (!user) {
      return res.status(200).json({ success: true, message: 'If the email exists, a reset link has been sent.' });
    }
    // Mock token reset
    res.json({ 
      success: true, 
      message: 'Password reset link sent successfully. Use token "RESET_TOKEN_MOCK_12345" to reset.',
      resetToken: 'RESET_TOKEN_MOCK_12345'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (token !== 'RESET_TOKEN_MOCK_12345') {
      return res.status(422).json({ success: false, message: 'Invalid reset token' });
    }

    // Since mock token, let's reset user admin@transitops.com's password as a fallback
    const user = await User.findOne({ email: 'admin@transitops.com' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = password;
    user.refreshTokens = []; // Revoke all sessions on password reset
    await user.save();

    res.json({ success: true, message: 'Password reset successful. Please login with your new password.' });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};
