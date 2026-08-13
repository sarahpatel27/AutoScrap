const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

async function login(req, res) {
  try {
    const { email, password, city } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // Fallback lookup by city if city dealer logging in with alternate email format
    if (!user && city) {
      user = await prisma.user.findFirst({
        where: { assignedCity: city },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token valid for 7 days
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        assignedCity: user.assignedCity,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const userData = {
      id: String(user.id),
      name: user.name,
      email: user.email,
      role: user.role,
      assignedCity: user.assignedCity,
      avatar: user.assignedCity ? '📍' : '🛡️',
    };

    res.json({
      token,
      user: userData,
    });
  } catch (err) {
    console.error('Auth Login Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function getCurrentUser(req, res) {
  try {
    const user = req.user;
    res.json({
      user: {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
        assignedCity: user.assignedCity,
        avatar: user.assignedCity ? '📍' : '🛡️',
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getUsers(req, res) {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Administrators can manage dealer accounts.' });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedCity: true,
        createdAt: true,
      },
    });

    res.json(
      users.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        assignedCity: u.assignedCity,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error('Get Users Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function createUser(req, res) {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Administrators can create dealer accounts.' });
    }

    const { email, password, name, assignedCity } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = assignedCity ? 'City Dealer' : 'Super Admin';
    const accountName = name || (assignedCity ? `${assignedCity} Dealer` : 'Administrator');

    const created = await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: accountName,
        role,
        assignedCity: assignedCity || null,
      },
    });

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedCity: true,
        createdAt: true,
      },
    });

    res.status(201).json(
      allUsers.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        assignedCity: u.assignedCity,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error('Create User Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Administrators can delete dealer accounts.' });
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (numericId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own active account.' });
    }

    await prisma.user.delete({
      where: { id: numericId },
    });

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        assignedCity: true,
        createdAt: true,
      },
    });

    res.json(
      allUsers.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        assignedCity: u.assignedCity,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters long.' });
    }

    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userRecord) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    // Verify current password against stored hash
    const isCurrentValid = await bcrypt.compare(currentPassword, userRecord.password);
    if (!isCurrentValid) {
      return res.status(400).json({ error: 'Current password is incorrect. Please verify and try again.' });
    }

    // Hash and update new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPasswordHash },
    });

    res.json({ message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change Password Error:', err);
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  login,
  getCurrentUser,
  getUsers,
  createUser,
  deleteUser,
  changePassword,
};
