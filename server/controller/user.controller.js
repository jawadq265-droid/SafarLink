import User from '../models/user.model.js';

/**
 * GET /api/v1/users
 * Returns all registered users (excluding password & reset tokens).
 * SuperAdmin only.
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .sort({ createdAt: -1 });

    const formatted = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      dateJoined: u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-PK', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'N/A',
    }));

    return res.status(200).json({ success: true, users: formatted });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

/**
 * DELETE /api/v1/users/:id
 * Permanently deletes a user by MongoDB _id.
 * SuperAdmin only.
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Prevent deleting the superadmin account
    if (user.role === 'superadmin' || user.email === 'superadmin@safarlink.com') {
      return res.status(403).json({ success: false, message: 'Cannot delete the superadmin account.' });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({ success: true, message: `User "${user.name}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};
