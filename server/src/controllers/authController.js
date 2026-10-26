import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function tokenFor(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}
function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, avatarUrl: user.avatarUrl };
}

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: 'Name, email and password are required.' });
    if (password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name: name.trim(), email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { next(e); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase().trim() }).select('+passwordHash');
    if (!user || !await bcrypt.compare(password || '', user.passwordHash)) return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { next(e); }
}

export function me(req, res) { res.json({ user: publicUser(req.user) }); }
