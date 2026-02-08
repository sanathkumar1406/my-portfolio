import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';

dotenv.config();

const projects = [
    {
        id: "1",
        title: "E-Commerce Platform",
        description: "A full-featured online store with payment processing, inventory management, and admin dashboard. Built with React, Node.js, and PostgreSQL.",
        technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "Redis"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: true,
    },
    {
        id: "2",
        title: "Task Management App",
        description: "Collaborative project management tool with real-time updates, drag-and-drop interface, and team collaboration features.",
        technologies: ["Next.js", "TypeScript", "Prisma", "WebSocket"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: true,
    },
    {
        id: "3",
        title: "Analytics Dashboard",
        description: "Real-time data visualization dashboard with interactive charts, custom reporting, and automated insights generation.",
        technologies: ["React", "D3.js", "Python", "FastAPI"],
        liveUrl: "https://example.com",
        githubUrl: "https://github.com",
        featured: true,
    },
    {
        id: "4",
        title: "Social Media API",
        description: "RESTful API for a social platform with authentication, rate limiting, and comprehensive documentation.",
        technologies: ["Node.js", "Express", "MongoDB", "JWT"],
        githubUrl: "https://github.com",
        featured: false,
    },
    {
        id: "5",
        title: "AI Content Generator",
        description: "Machine learning powered content generation tool with customizable templates and tone adjustment.",
        technologies: ["Python", "OpenAI", "React", "FastAPI"],
        liveUrl: "https://example.com",
        featured: false,
    },
    {
        id: "6",
        title: "DevOps Automation",
        description: "CI/CD pipeline automation tools with Docker integration, testing frameworks, and deployment scripts.",
        technologies: ["Docker", "GitHub Actions", "Terraform", "AWS"],
        githubUrl: "https://github.com",
        featured: false,
    },
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing data
        await Project.deleteMany({});
        console.log('Cleared existing projects');

        // Insert new data
        await Project.insertMany(projects);
        console.log('Seeded projects');

        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error seeding database:', err);
        mongoose.disconnect();
    });
