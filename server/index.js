import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { auth } from './middleware/auth.js';
import Project from './models/Project.js';
import Skill from './models/Skill.js';
import About from './models/About.js';
import Contact from './models/Contact.js';
import Home from './models/Home.js';
import Profile from './models/Profile.js';
import Certificate from './models/Certificate.js';
import SiteSettings from './models/SiteSettings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check to verify this exact server code is running
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        server: 'skill-showcase-hub-main',
        hasHomeRoutes: true,
        hasProjectImageUpload: true,
    });
});

// Serve uploaded files
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      if (file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only PDF files are allowed for resume'));
      }
    } else if (file.fieldname === 'image' || file.fieldname === 'photo' || file.fieldname === 'file') {
      if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
      } else {
        cb(new Error('Only image and PDF files are allowed'));
      }
    } else {
      cb(null, true);
    }
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Admin Login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { password } = req.body;
        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== HOME API ==========
app.get('/api/home', async (req, res) => {
    try {
        let home = await Home.findOne({ id: 'home' });
        if (!home) {
            home = new Home({
                id: 'home',
                name: 'Your Name',
                tagline: 'Full Stack Developer specializing in building exceptional digital experiences. I create elegant, performant, and accessible web applications.',
                resumeUrl: null
            });
            await home.save();
        }
        res.json({ success: true, home });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/home', auth, async (req, res) => {
    try {
        const home = await Home.findOneAndUpdate(
            { id: 'home' },
            req.body,
            { new: true, upsert: true }
        );
        res.json({ success: true, home });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/home/resume', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const home = await Home.findOne({ id: 'home' });
        // Delete old resume file if exists
        if (home && home.resumeUrl) {
            const oldResumePath = path.join(__dirname, '../public', home.resumeUrl);
            if (fs.existsSync(oldResumePath)) {
                fs.unlinkSync(oldResumePath);
            }
        }
        const resumeUrl = `/uploads/${req.file.filename}`;
        const updatedHome = await Home.findOneAndUpdate(
            { id: 'home' },
            { resumeUrl },
            { new: true, upsert: true }
        );
        res.json({ success: true, resumeUrl, home: updatedHome });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/home/resume', auth, async (req, res) => {
    try {
        const home = await Home.findOne({ id: 'home' });
        if (home && home.resumeUrl) {
            // Delete the file from filesystem
            const resumePath = path.join(__dirname, '../public', home.resumeUrl);
            if (fs.existsSync(resumePath)) {
                fs.unlinkSync(resumePath);
            }
        }
        const updatedHome = await Home.findOneAndUpdate(
            { id: 'home' },
            { $unset: { resumeUrl: '' } },
            { new: true }
        );
        res.json({ success: true, home: updatedHome });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/api/home/photo', auth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const photoUrl = `/uploads/${req.file.filename}`;
        const home = await Home.findOneAndUpdate(
            { id: 'home' },
            { photoUrl },
            { new: true, upsert: true }
        );
        res.json({ success: true, photoUrl, home });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/home/photo', auth, async (req, res) => {
    try {
        const home = await Home.findOne({ id: 'home' });
        if (home && home.photoUrl) {
            // Delete the file from filesystem
            const photoPath = path.join(__dirname, '../public', home.photoUrl);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        const updatedHome = await Home.findOneAndUpdate(
            { id: 'home' },
            { $unset: { photoUrl: '' } },
            { new: true }
        );
        res.json({ success: true, home: updatedHome });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========== PROJECT IMAGE UPLOAD ==========
app.post('/api/projects/:id/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        // Try matching by custom string id first
        let project = await Project.findOne({ id: req.params.id });
        // Fallback: try using Mongo _id (for older data that might not have the custom id field)
        if (!project) {
            try {
                project = await Project.findById(req.params.id);
            } catch {
                // ignore cast errors; will be handled below
            }
        }
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        // Delete old image if exists
        if (project.imageUrl) {
            const oldImagePath = path.join(__dirname, '../public', project.imageUrl);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        
        project.imageUrl = imageUrl;
        await project.save();
        res.json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/projects/:id/image', auth, async (req, res) => {
    try {
        // Try matching by custom string id first
        let project = await Project.findOne({ id: req.params.id });
        // Fallback: try using Mongo _id
        if (!project) {
            try {
                project = await Project.findById(req.params.id);
            } catch {
                // ignore cast errors
            }
        }
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        
        // Delete the image file if exists
        if (project.imageUrl) {
            const imagePath = path.join(__dirname, '../public', project.imageUrl);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        project.imageUrl = undefined;
        await project.save();
        res.json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// Public Routes
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ featured: -1, _id: 1 });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: error.message });
    }
});

// Protected Routes
app.post('/api/projects', auth, async (req, res) => {
    try {
        const project = new Project(req.body);
        await project.save();
        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/projects/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        res.json({ success: true, project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/projects/:id', auth, async (req, res) => {
    try {
        const project = await Project.findOneAndDelete({ id: req.params.id });
        if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
        res.json({ success: true, message: 'Project deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== PROFILES API ==========
app.get('/api/profiles', async (req, res) => {
    try {
        const profiles = await Profile.find().sort({ order: 1, _id: 1 });
        res.json({ success: true, profiles });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/profiles', auth, async (req, res) => {
    try {
        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json({ success: true, profile });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/profiles/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
        res.json({ success: true, profile });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/profiles/:id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOneAndDelete({ id: req.params.id });
        if (!profile) return res.status(404).json({ success: false, error: 'Profile not found' });
        res.json({ success: true, message: 'Profile deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ========== SKILLS API ==========
app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ order: 1, _id: 1 });
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post('/api/skills', auth, async (req, res) => {
    try {
        const skill = new Skill(req.body);
        await skill.save();
        res.status(201).json(skill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.put('/api/skills/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findOneAndUpdate(
            { id: req.params.id },
            req.body,
            { new: true }
        );
        if (!skill) return res.status(404).json({ message: 'Skill category not found' });
        res.json(skill);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.delete('/api/skills/:id', auth, async (req, res) => {
    try {
        const skill = await Skill.findOneAndDelete({ id: req.params.id });
        if (!skill) return res.status(404).json({ message: 'Skill category not found' });
        res.json({ message: 'Skill category deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ========== ABOUT API ==========
app.get('/api/about', async (req, res) => {
    try {
        let about = await About.findOne({ id: 'about' });
        if (!about) {
            about = new About({
                id: 'about',
                bio: 'I\'m a Full Stack Developer with over 5 years of experience building web applications that make a difference.',
                education: []
            });
            await about.save();
        }
        res.json(about);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/about', auth, async (req, res) => {
    try {
        const about = await About.findOneAndUpdate(
            { id: 'about' },
            req.body,
            { new: true, upsert: true }
        );
        res.json(about);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ========== CONTACT API ==========
app.get('/api/contact', async (req, res) => {
    try {
        let contact = await Contact.findOne({ id: 'contact' });
        if (!contact) {
            contact = new Contact({
                id: 'contact',
                email: 'your.email@example.com',
                phone: '+1 (555) 123-4567',
                location: 'San Francisco, CA',
                socialLinks: {}
            });
            await contact.save();
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.put('/api/contact', auth, async (req, res) => {
    try {
        const contact = await Contact.findOneAndUpdate(
            { id: 'contact' },
            req.body,
            { new: true, upsert: true }
        );
        res.json(contact);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ========== CONTACT FORM EMAIL ==========
app.post('/api/contact/send', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        // Validate SMTP configuration first
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            return res.status(500).json({ success: false, error: 'Email service not configured. Please set SMTP_USER and SMTP_PASS in environment variables.' });
        }

        // Get contact info to send email to
        const contact = await Contact.findOne({ id: 'contact' });
        if (!contact || !contact.email) {
            return res.status(500).json({ success: false, error: 'Contact email not configured in database. Please update your contact information.' });
        }

        // Get your email from environment variable (preferred) or use contact email as fallback
        // This is where YOU want to receive the messages
        // Set CONTACT_RECIPIENT_EMAIL in .env to specify where you want to receive contact form messages
        const yourEmail = (process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER || contact.email).trim();
        const userEmail = email.trim(); // The user who filled the form
        const userName = name.trim();

        // Log for debugging
        console.log('Email Configuration:', {
            from: `"Portfolio Contact - ${userName}" <${process.env.SMTP_USER}>`,
            to: yourEmail,
            replyTo: userEmail,
            note: 'FROM uses authenticated email (Gmail requirement), REPLY-TO is user email'
        });

        // Configure nodemailer transporter
        // Note: Gmail requires "from" to match authenticated account, so we use SMTP_USER
        // But we set replyTo to user's email so replies go directly to them
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Email content
        // Try to use user's email in FROM field (Gmail may rewrite it, but we try)
        // TO: Your email (where you want to receive messages)
        // REPLY-TO: User's email (so when you reply, it goes directly to the user)
        const mailOptions = {
            from: `"${userName}" <${userEmail}>`,
            to: yourEmail,
            replyTo: `"${userName}" <${userEmail}>`,
            subject: `Portfolio Contact from ${userName}: ${subject}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
                        New Contact Form Submission
                    </h2>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p style="margin: 10px 0;"><strong style="color: #555;">From:</strong> ${userName} &lt;${userEmail}&gt;</p>
                        <p style="margin: 10px 0;"><strong style="color: #555;">Subject:</strong> ${subject}</p>
                    </div>
                    <div style="background-color: #fff; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Message:</h3>
                        <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message.replace(/\n/g, '<br>')}</p>
                    </div>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
                        <p>Reply to this email to respond directly to ${userName} at ${userEmail}</p>
                    </div>
                </div>
            `,
            text: `
New Contact Form Submission

From: ${userName} <${userEmail}>
Subject: ${subject}

Message:
${message}

---
Reply to this email to respond directly to ${userName} at ${userEmail}
            `,
        };

        // Try to send email with user's email as FROM
        // If Gmail rejects it (because FROM doesn't match authenticated account),
        // fall back to using authenticated email in FROM field
        let info;
        try {
            info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully with user email as FROM:', {
                messageId: info.messageId,
                from: mailOptions.from,
                to: mailOptions.to,
                replyTo: mailOptions.replyTo
            });
        } catch (sendError) {
            // If Gmail rejects the custom FROM address, fall back to authenticated email
            if (sendError.code === 'EAUTH' || (sendError.message && (sendError.message.includes('from') || sendError.message.includes('sender')))) {
                console.log('Gmail rejected custom FROM address, using authenticated email instead');
                mailOptions.from = `"Portfolio Contact - ${userName}" <${process.env.SMTP_USER}>`;
                info = await transporter.sendMail(mailOptions);
                console.log('Email sent successfully with authenticated email as FROM:', {
                    messageId: info.messageId,
                    from: mailOptions.from,
                    to: mailOptions.to,
                    replyTo: mailOptions.replyTo,
                    note: 'Gmail requires FROM to match authenticated account'
                });
            } else {
                throw sendError;
            }
        }

        res.json({ 
            success: true, 
            message: 'Message sent successfully',
            details: {
                sentFrom: mailOptions.from,
                sentTo: yourEmail,
                replyTo: userEmail,
                note: 'Reply to this email to respond directly to the user'
            }
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send message. Please try again later.' });
    }
});

// ========== CERTIFICATES API ==========
app.get('/api/certificates', async (req, res) => {
    try {
        const certificates = await Certificate.find().sort({ createdAt: -1 });
        res.json(certificates);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/certificates', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const { title, issuer } = req.body;
        if (!title || !issuer) {
            return res.status(400).json({ success: false, error: 'Title and issuer are required' });
        }

        const fileUrl = `/uploads/${req.file.filename}`;
        const fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';

        const certificate = new Certificate({
            title,
            issuer,
            fileUrl,
            fileType
        });

        await certificate.save();
        res.json({ success: true, certificate });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.put('/api/certificates/:id', auth, upload.single('file'), async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);
        if (!certificate) {
            return res.status(404).json({ success: false, error: 'Certificate not found' });
        }

        const { title, issuer } = req.body;
        if (title) certificate.title = title;
        if (issuer) certificate.issuer = issuer;

        // If a new file is uploaded, replace the old one
        if (req.file) {
            // Delete old file
            if (certificate.fileUrl) {
                const oldFilePath = path.join(__dirname, '../public', certificate.fileUrl);
                if (fs.existsSync(oldFilePath)) {
                    fs.unlinkSync(oldFilePath);
                }
            }

            certificate.fileUrl = `/uploads/${req.file.filename}`;
            certificate.fileType = req.file.mimetype === 'application/pdf' ? 'pdf' : 'image';
        }

        await certificate.save();
        res.json({ success: true, certificate });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.delete('/api/certificates/:id', auth, async (req, res) => {
    try {
        const certificate = await Certificate.findById(req.params.id);
        if (!certificate) {
            return res.status(404).json({ success: false, error: 'Certificate not found' });
        }

        // Delete the file
        if (certificate.fileUrl) {
            const filePath = path.join(__dirname, '../public', certificate.fileUrl);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Certificate.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Certificate deleted' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ========== SITE SETTINGS API (Footer Links) ==========
app.get('/api/site-settings', async (req, res) => {
    try {
        let settings = await SiteSettings.findOne({ id: 'siteSettings' });
        if (!settings) {
            // Create default settings if none exist
            settings = new SiteSettings({
                id: 'siteSettings',
                footerLinks: {
                    github: 'https://github.com/sanathkumar1406',
                    linkedin: 'https://www.linkedin.com/in/sanath-kumar-1a690a338',
                    twitter: 'https://twitter.com',
                    email: 'mailto:your.email@example.com',
                }
            });
            await settings.save();
        }
        res.json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/site-settings', auth, async (req, res) => {
    try {
        const { footerLinks } = req.body;
        
        // Validate URLs and email
        if (footerLinks) {
            if (footerLinks.github && !footerLinks.github.startsWith('http')) {
                return res.status(400).json({ success: false, error: 'GitHub URL must start with http' });
            }
            if (footerLinks.linkedin && !footerLinks.linkedin.startsWith('http')) {
                return res.status(400).json({ success: false, error: 'LinkedIn URL must start with http' });
            }
            if (footerLinks.twitter && !footerLinks.twitter.startsWith('http')) {
                return res.status(400).json({ success: false, error: 'Twitter URL must start with http' });
            }
            if (footerLinks.email && !footerLinks.email.startsWith('mailto:')) {
                // Auto-add mailto: if not present
                footerLinks.email = `mailto:${footerLinks.email}`;
            }
        }

        const settings = await SiteSettings.findOneAndUpdate(
            { id: 'siteSettings' },
            { footerLinks: footerLinks || {} },
            { new: true, upsert: true }
        );
        res.json({ success: true, settings });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
