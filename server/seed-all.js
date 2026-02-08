import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Project from './models/Project.js';
import Skill from './models/Skill.js';
import About from './models/About.js';
import Contact from './models/Contact.js';
import Home from './models/Home.js';
import Profile from './models/Profile.js';

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

const skills = [
    {
        id: "1",
        title: "Frontend Development",
        icon: "Code",
        skills: [
            "JavaScript (ES6+)",
            "TypeScript",
            "React.js",
            "Next.js",
            "HTML5 & CSS3",
            "Tailwind CSS",
            "Redux",
            "Framer Motion",
        ],
        order: 0,
    },
    {
        id: "2",
        title: "Backend Development",
        icon: "Server",
        skills: [
            "Node.js",
            "Express.js",
            "Python",
            "REST APIs",
            "GraphQL",
            "WebSocket",
            "Microservices",
            "API Design",
        ],
        order: 1,
    },
    {
        id: "3",
        title: "Database & Storage",
        icon: "Database",
        skills: [
            "PostgreSQL",
            "MongoDB",
            "Redis",
            "MySQL",
            "Prisma ORM",
            "Supabase",
        ],
        order: 2,
    },
    {
        id: "4",
        title: "Cloud & DevOps",
        icon: "Cloud",
        skills: [
            "AWS (EC2, S3, Lambda)",
            "Docker",
            "Kubernetes",
            "CI/CD",
            "GitHub Actions",
            "Vercel",
        ],
        order: 3,
    },
    {
        id: "5",
        title: "Tools & Practices",
        icon: "Wrench",
        skills: [
            "Git & GitHub",
            "VS Code",
            "Jest & Testing",
            "Agile/Scrum",
            "Jira",
            "Figma",
        ],
        order: 4,
    },
    {
        id: "6",
        title: "Soft Skills",
        icon: "Users",
        skills: [
            "Team Leadership",
            "Communication",
            "Problem Solving",
            "Code Review",
            "Mentoring",
            "Documentation",
        ],
        order: 5,
    },
];

const about = {
    id: "about",
    bio: "I'm a Full Stack Developer with over 5 years of experience building web applications that make a difference. I specialize in JavaScript/TypeScript ecosystems, with deep expertise in React, Node.js, and modern cloud technologies.\n\nMy approach combines clean code principles with user-centered design thinking. I believe in writing maintainable, well-tested code that scales. When I'm not coding, you'll find me contributing to open source, writing technical articles, or exploring new technologies.",
    education: [
        {
            degree: "Bachelor of Science in Computer Science",
            school: "University Name",
            period: "2014 - 2018",
        },
    ],
};

const contact = {
    id: "contact",
    email: "your.email@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        twitter: "https://twitter.com",
        website: "https://example.com",
    },
};

const profiles = [
    {
        id: "1",
        name: "GitHub",
        username: "@sanathkumar1406",
        url: "https://github.com/sanathkumar1406",
        stats: "500+ contributions",
        description: "Open source contributions, personal projects, and code repositories.",
        color: "bg-foreground",
        order: 0,
    },
    {
        id: "2",
        name: "LeetCode",
        username: "yourusername",
        url: "https://leetcode.com/yourusername",
        stats: "300+ problems solved",
        description: "Data structures and algorithms practice, problem-solving skills.",
        color: "bg-amber-500",
        order: 1,
    },
    {
        id: "3",
        name: "HackerRank",
        username: "yourusername",
        url: "https://hackerrank.com/yourusername",
        stats: "5-star rating",
        description: "Coding challenges, certifications, and skill assessments.",
        color: "bg-emerald-500",
        order: 2,
    },
    {
        id: "4",
        name: "Stack Overflow",
        username: "yourusername",
        url: "https://stackoverflow.com/users/yourid",
        stats: "2,500+ reputation",
        description: "Community contributions, answers, and technical discussions.",
        color: "bg-orange-500",
        order: 3,
    },
    {
        id: "5",
        name: "CodePen",
        username: "@yourusername",
        url: "https://codepen.io/yourusername",
        stats: "50+ pens",
        description: "Frontend experiments, UI components, and creative coding.",
        color: "bg-gray-500",
        order: 4,
    },
    {
        id: "6",
        name: "Dev.to",
        username: "@yourusername",
        url: "https://dev.to/yourusername",
        stats: "20+ articles",
        description: "Technical writing, tutorials, and developer community engagement.",
        color: "bg-violet-500",
        order: 5,
    },
];

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        // Clear existing data
        await Project.deleteMany({});
        await Skill.deleteMany({});
        await About.deleteMany({});
        await Contact.deleteMany({});
        await Home.deleteMany({});
        await Profile.deleteMany({});
        console.log('Cleared existing data');

        // Insert new data
        await Project.insertMany(projects);
        console.log('Seeded projects');

        await Skill.insertMany(skills);
        console.log('Seeded skills');

        await About.create(about);
        console.log('Seeded about');

        await Contact.create(contact);
        console.log('Seeded contact');

        await Home.create({
            id: 'home',
            name: 'Your Name',
            tagline: 'Full Stack Developer specializing in building exceptional digital experiences. I create elegant, performant, and accessible web applications.',
            resumeUrl: null,
            photoUrl: null,
            availableForOpportunities: true
        });
        console.log('Seeded home');

        await Profile.insertMany(profiles);
        console.log('Seeded profiles');

        console.log('\n✅ All data seeded successfully!');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error seeding database:', err);
        mongoose.disconnect();
    });
