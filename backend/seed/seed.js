require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

const opportunities = [
  {
    title: 'Frontend Developer Intern',
    company: 'TechNova Solutions',
    domain: 'Software Development',
    location: 'Hyderabad (Hybrid)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹25,000 / month',
    description:
      'Work with the product team to build responsive UI components in React.js. You will learn state management, REST API integration and Git workflows. Mentorship from senior engineers included.',
    applicationLink: 'https://technova.example.com/careers/frontend-intern',
  },
  {
    title: 'Full Stack Developer Intern',
    company: 'CloudKite',
    domain: 'Software Development',
    location: 'Bengaluru (On-site)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹30,000 / month',
    description:
      'Build features across the stack: Node.js + Express APIs, MongoDB models and a React frontend. Great for beginners who want end-to-end project exposure.',
    applicationLink: 'https://cloudkite.example.com/apply/fullstack-intern',
  },
  {
    title: 'Junior Backend Engineer',
    company: 'DataBridge Analytics',
    domain: 'Software Development',
    location: 'Remote',
    experience: '1-2 years',
    type: 'Job',
    salary: '₹8 - 12 LPA',
    description:
      'Design and maintain REST APIs in Node.js, write MongoDB aggregation pipelines and add unit tests. You will own small services end to end.',
    applicationLink: 'https://databridge.example.com/jobs/backend-junior',
  },
  {
    title: 'Data Science Intern',
    company: 'Insight Labs',
    domain: 'Data Science',
    location: 'Pune (On-site)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹28,000 / month',
    description:
      'Clean and explore datasets with Python and pandas, build simple ML models and create dashboards. Prior coursework in statistics is enough to apply.',
    applicationLink: 'https://insightlabs.example.com/internships/data-science',
  },
  {
    title: 'Machine Learning Intern',
    company: 'VisionAI',
    domain: 'Data Science',
    location: 'Remote',
    experience: '0-2 years',
    type: 'Internship',
    salary: '₹35,000 / month',
    description:
      'Assist the ML team with image classification experiments using PyTorch. You will learn experiment tracking, model evaluation and deployment basics.',
    applicationLink: 'https://visionai.example.com/careers/ml-intern',
  },
  {
    title: 'UI/UX Design Intern',
    company: 'PixelCraft Studio',
    domain: 'Design',
    location: 'Hyderabad (On-site)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹20,000 / month',
    description:
      'Design mobile and web screens in Figma, run usability tests and hand off specs to developers. A small portfolio (even class projects) is enough to apply.',
    applicationLink: 'https://pixelcraft.example.com/apply/uiux-intern',
  },
  {
    title: 'Graphic Designer',
    company: 'BrightMedia Agency',
    domain: 'Design',
    location: 'Mumbai (Hybrid)',
    experience: '1-3 years',
    type: 'Job',
    salary: '₹6 - 9 LPA',
    description:
      'Create social media creatives, brand assets and campaign visuals. Proficiency in Photoshop/Illustrator or Figma required.',
    applicationLink: 'https://brightmedia.example.com/jobs/graphic-designer',
  },
  {
    title: 'Digital Marketing Intern',
    company: 'GrowthHive',
    domain: 'Marketing',
    location: 'Remote',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹18,000 / month',
    description:
      'Run email campaigns, manage social channels and analyse funnel metrics. Learn SEO basics, Google Analytics and Meta Ads manager hands-on.',
    applicationLink: 'https://growthhive.example.com/internships/marketing',
  },
  {
    title: 'Finance Analyst Intern',
    company: 'FinEdge Capital',
    domain: 'Finance',
    location: 'Hyderabad (On-site)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹22,000 / month',
    description:
      'Prepare financial models in Excel, analyse quarterly reports and support budgeting for clients. CA/CMA students preferred.',
    applicationLink: 'https://finedge.example.com/careers/finance-intern',
  },
  {
    title: 'HR Generalist Intern',
    company: 'PeopleFirst',
    domain: 'Human Resources',
    location: 'Chennai (Hybrid)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹18,000 / month',
    description:
      'Support recruitment coordination, onboarding paperwork and employee engagement activities. Great for students interested in people operations.',
    applicationLink: 'https://peoplefirst.example.com/apply/hr-intern',
  },
  {
    title: 'Cybersecurity Intern',
    company: 'SecureLayer',
    domain: 'Cybersecurity',
    location: 'Remote',
    experience: '0-2 years',
    type: 'Internship',
    salary: '₹25,000 / month',
    description:
      'Learn about vulnerability scanning, log analysis and incident response. Work alongside analysts on real security monitoring dashboards.',
    applicationLink: 'https://securelayer.example.com/careers/security-intern',
  },
  {
    title: 'Product Management Intern',
    company: 'LaunchPad',
    domain: 'Product Management',
    location: 'Bengaluru (Hybrid)',
    experience: '0-1 years',
    type: 'Internship',
    salary: '₹35,000 / month',
    description:
      'Write user stories, prioritise the backlog with the PM team and talk to users. Ideal for students who love organising ideas into shipped features.',
    applicationLink: 'https://launchpad.example.com/internships/pm',
  },
];

async function seedDatabase(options = {}) {
  const { force = false } = options;
  if (!force) {
    const count = await Opportunity.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} opportunities. Auto-seeding skipped.`);
      return;
    }
  }

  await Opportunity.deleteMany({});
  await Application.deleteMany({});

  const created = await Opportunity.insertMany(opportunities);
  console.log(`Seeded ${created.length} opportunities`);

  // A couple of sample applications so the admin "View Applications" page has data
  await Application.create([
    {
      opportunity: created[0]._id,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '9876543210',
      resumeLink: 'https://drive.example.com/resume/aarav.pdf',
      coverLetter: 'I built two React projects and want to learn production workflows.',
    },
    {
      opportunity: created[3]._id,
      name: 'Diya Reddy',
      email: 'diya.reddy@example.com',
      phone: '9123456780',
      resumeLink: 'https://drive.example.com/resume/diya.pdf',
      coverLetter: 'Final-year CSE student with a pandas project on sales forecasting.',
    },
  ]);
  console.log('Seeded 2 sample applications');
}

if (require.main === module) {
  connectDB()
    .then(() => seedDatabase({ force: true }))
    .then(async () => {
      await mongoose.connection.close();
      console.log('Done. Database connection closed.');
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase, opportunities };
