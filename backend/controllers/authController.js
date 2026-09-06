const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');
const { sendAccountCreatedNotification } = require('../services/emailService');

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

    if (user.isActive === false) {
      return res.status(403).json({
        error: 'This account has been deactivated because coverage for its assigned city was removed. Please contact the administrator.',
      });
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
      coveredPostcodes: user.coveredPostcodes || [],
      avatar: user.role === 'City Dealer' ? '📍' : '🛡️',
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
        coveredPostcodes: user.coveredPostcodes || [],
        avatar: user.role === 'City Dealer' ? '📍' : '🛡️',
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
      include: {
        city: true,
      },
    });

    res.json(
      users.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive !== false,
        cityId: u.cityId || u.city?.id || null,
        assignedCity: u.city?.name || u.assignedCity || null,
        coveredPostcodes: u.coveredPostcodes || [],
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

    const { email, password, name, assignedCity, cityId, coveredPostcodes, role: requestedRole } = req.body;

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

    // Resolve active city if provided (for legacy compatibility)
    let resolvedCityId = null;
    let resolvedCityName = null;

    if (cityId) {
      const cityRec = await prisma.city.findUnique({
        where: { id: parseInt(cityId, 10) },
      });
      if (cityRec && cityRec.isActive) {
        resolvedCityId = cityRec.id;
        resolvedCityName = cityRec.name;
      }
    } else if (assignedCity && assignedCity.trim()) {
      const cityRec = await prisma.city.findFirst({
        where: {
          name: { equals: assignedCity.trim(), mode: 'insensitive' },
          isActive: true,
        },
      });
      if (cityRec) {
        resolvedCityId = cityRec.id;
        resolvedCityName = cityRec.name;
      }
    }

    // Process covered outward district postcodes
    let postcodesArray = [];
    if (Array.isArray(coveredPostcodes)) {
      postcodesArray = coveredPostcodes.map((p) => String(p).trim().toUpperCase()).filter(Boolean);
    } else if (typeof coveredPostcodes === 'string') {
      postcodesArray = coveredPostcodes.split(',').map((p) => p.trim().toUpperCase()).filter(Boolean);
    }
    postcodesArray = Array.from(new Set(postcodesArray));

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = requestedRole
      ? (requestedRole === 'Super Admin' ? 'Super Admin' : 'City Dealer')
      : ((resolvedCityName || postcodesArray.length > 0) ? 'City Dealer' : 'City Dealer');

    const accountName = name || (postcodesArray.length > 0 ? `${postcodesArray.join('/')} Dealer` : (role === 'City Dealer' ? 'Dealer Account' : 'Administrator'));

    await prisma.user.create({
      data: {
        email: cleanEmail,
        password: hashedPassword,
        name: accountName,
        role,
        cityId: resolvedCityId,
        assignedCity: resolvedCityName,
        coveredPostcodes: postcodesArray,
      },
    });

    // Send account creation email with credentials, role, and portal URL
    sendAccountCreatedNotification({
      name: accountName,
      email: cleanEmail,
      password,
      role,
      assignedCity: postcodesArray.length > 0 ? postcodesArray.join(', ') : (role === 'City Dealer' ? 'Dealer Coverage' : 'National'),
    }).catch((emailErr) => {
      console.error('[AuthController] Failed to send account creation email:', emailErr.message);
    });

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        city: true,
      },
    });

    res.status(201).json(
      allUsers.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive !== false,
        cityId: u.cityId || u.city?.id || null,
        assignedCity: u.city?.name || u.assignedCity || null,
        coveredPostcodes: u.coveredPostcodes || [],
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error('Create User Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function pruneOrphanDistrictPricing() {
  try {
    const activeDealers = await prisma.user.findMany({
      where: { role: 'City Dealer', isActive: true },
      select: { coveredPostcodes: true },
    });
    const activeSet = new Set();
    for (const d of activeDealers) {
      for (const p of (d.coveredPostcodes || [])) {
        if (p && p.trim()) activeSet.add(p.trim().toUpperCase());
      }
    }
    const allActive = Array.from(activeSet);
    if (allActive.length > 0) {
      await prisma.districtPricing.deleteMany({
        where: { district: { notIn: allActive } },
      });
    } else {
      await prisma.districtPricing.deleteMany({});
    }
  } catch (err) {
    console.error('Error pruning orphan district pricing:', err);
  }
}

async function updateDealerCoverage(req, res) {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Administrators can update dealer coverage.' });
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return res.status(400).json({ error: 'Invalid dealer user ID.' });
    }

    const { coveredPostcodes, name, assignedCity, isActive } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { id: numericId },
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'Dealer account not found.' });
    }

    const updateData = {};

    if (coveredPostcodes !== undefined) {
      let postcodesArray = [];
      if (Array.isArray(coveredPostcodes)) {
        postcodesArray = coveredPostcodes.map((p) => String(p).trim().toUpperCase()).filter(Boolean);
      } else if (typeof coveredPostcodes === 'string') {
        postcodesArray = coveredPostcodes.split(',').map((p) => p.trim().toUpperCase()).filter(Boolean);
      }
      updateData.coveredPostcodes = Array.from(new Set(postcodesArray));
    }

    if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
    }

    if (assignedCity !== undefined) {
      updateData.assignedCity = assignedCity ? assignedCity.trim() : null;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    await prisma.user.update({
      where: { id: numericId },
      data: updateData,
    });

    // Immediately clean up any district pricing rows for districts that are no longer covered by active dealers
    await pruneOrphanDistrictPricing();

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { city: true },
    });

    res.json(
      allUsers.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive !== false,
        cityId: u.cityId || u.city?.id || null,
        assignedCity: u.city?.name || u.assignedCity || null,
        coveredPostcodes: u.coveredPostcodes || [],
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error('Update Dealer Coverage Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function deleteUser(req, res) {
  try {
    if (req.user.role !== 'Super Admin') {
      return res.status(403).json({ error: 'Only Super Administrators can delete user accounts.' });
    }

    const { id } = req.params;
    const numericId = parseInt(id, 10);

    if (numericId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own currently logged-in account.' });
    }

    await prisma.user.delete({
      where: { id: numericId },
    });

    // Immediately clean up any district pricing rows for districts that are no longer covered by active dealers
    await pruneOrphanDistrictPricing();

    const allUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        city: true,
      },
    });

    res.json(
      allUsers.map((u) => ({
        id: String(u.id),
        email: u.email,
        name: u.name,
        role: u.role,
        isActive: u.isActive !== false,
        cityId: u.cityId || u.city?.id || null,
        assignedCity: u.city?.name || u.assignedCity || null,
        createdAt: u.createdAt,
      }))
    );
  } catch (err) {
    console.error('Delete User Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Display name cannot be empty.' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 100) {
      return res.status(400).json({ error: 'Display name cannot exceed 100 characters.' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: trimmedName },
    });

    const userData = {
      id: String(updatedUser.id),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      assignedCity: updatedUser.assignedCity,
      coveredPostcodes: updatedUser.coveredPostcodes || [],
      avatar: updatedUser.role === 'City Dealer' ? '📍' : '🛡️',
    };

    res.json({
      message: 'Profile name updated successfully.',
      user: userData,
    });
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ error: err.message });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, name } = req.body;
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
    const updateData = { password: newPasswordHash };

    if (name && typeof name === 'string' && name.trim()) {
      updateData.name = name.trim().slice(0, 100);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const userData = {
      id: String(updatedUser.id),
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      assignedCity: updatedUser.assignedCity,
      coveredPostcodes: updatedUser.coveredPostcodes || [],
      avatar: updatedUser.role === 'City Dealer' ? '📍' : '🛡️',
    };

    res.json({
      message: 'Password updated successfully.',
      user: userData,
    });
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
  updateDealerCoverage,
  deleteUser,
  changePassword,
  updateProfile,
};
