const Academy = require('../models/Academy');
const User = require('../models/User');
const { ROLES } = require('../config/constants');

exports.createAcademy = async (req, res) => {
    try {
        const { name, subdomain, adminUsername, adminPassword, adminName, adminEmail } = req.body;

        // Validation
        if (!name || !subdomain || !adminUsername || !adminPassword) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

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
            role: 'ACADEMY_ADMIN',
            email: adminEmail
        });
        console.log('Admin user created:', newUser);

        // 3. Update Academy owner
        await Academy.update(newAcademy.id, { owner_id: newUser.id });
        console.log('Academy owner updated');

        res.status(201).json({ academy: newAcademy, admin: newUser });

    } catch (error) {
        console.error(error);
        // Check for Supabase unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({ message: 'Subdomain or username already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
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
