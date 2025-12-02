const Academy = require('../models/Academy');

const User = require('../models/User');
const database = require('../config/database');
const { ROLES } = require('../config/constants');

exports.createAcademy = async (req, res) => {
    const pool = database.getPool();
    const connection = await pool.getConnection();

    try {
        const { name, subdomain, adminUsername, adminPassword, adminName, adminEmail } = req.body;

        // Validation
        if (!name || !subdomain || !adminUsername || !adminPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Start transaction (manual handling since models use auto-commit usually, but we need atomicity)
        // Note: Our models currently commit individually. For true transaction, we should pass connection to models.
        // For now, we'll do it sequentially and handle cleanup on error if possible, or rely on manual fix.
        // Ideally, models should accept an optional connection parameter.

        // 1. Create Academy
        console.log('Creating academy with data:', { name, subdomain });
        const newAcademy = await Academy.create({
            name,
            subdomain,
            owner_id: null // Will update after creating user
        });
        console.log('Academy created:', newAcademy);

        // 2. Create Academy Admin User
        console.log('Creating admin user with data:', { adminUsername, adminEmail });
        const newUser = await User.create({
            academy_id: newAcademy.id,
            username: adminUsername,
            password: adminPassword,
            full_name: adminName || 'Academy Admin',
            role: 'ACADEMY_ADMIN', // Use uppercase to match frontend Login.jsx
            email: adminEmail
        });
        console.log('Admin user created:', newUser);

        // 3. Update Academy owner
        await Academy.update(newAcademy.id, { owner_id: newUser.id });
        console.log('Academy owner updated');

        res.status(201).json({ academy: newAcademy, admin: newUser });

    } catch (error) {
        console.error(error);
        if (error.code === 'ORA-00001') { // Unique constraint violation
            return res.status(409).json({ message: 'Subdomain or username already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        if (connection) await connection.close();
    }
};

exports.getAllAcademies = async (req, res) => {
    try {
        const academies = await Academy.findAll();
        res.json(academies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAcademyById = async (req, res) => {
    try {
        const academy = await Academy.findById(req.params.id);
        if (!academy) {
            return res.status(404).json({ message: 'Academy not found' });
        }
        res.json(academy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAcademy = async (req, res) => {
    try {
        const updatedAcademy = await Academy.update(req.params.id, req.body);
        res.json(updatedAcademy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
