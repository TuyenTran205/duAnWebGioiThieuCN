export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  type: string;
  link: string;
}

export const projectsData: Project[] = [
  {
    id: '1',
    title: 'Health Tracker',
    description: 'An AI-powered health monitoring and tracking application.',
    technologies: ['Flutter', 'Cloudflare Workers AI'],
    type: 'AI Application',
    link: 'https://github.com/Tqh2410/g9-personal-health-tracker/tree/feature/trang-chu'
  },
  {
    id: '2',
    title: 'Expense Tracker',
    description: 'A mobile application for managing personal and team financial expenses.',
    technologies: ['Flutter', 'Firebase'],
    type: 'Team Project (Mobile App)',
    link: 'https://github.com/TuyenTran205/Expense-Tracker-App'
  },
  {
    id: '3',
    title: 'Personal Portfolio & Document Hub',
    description: 'A web application showcase for student profiles and academic resource sharing.',
    technologies: ['React', 'TypeScript', 'Bootstrap', 'Vite'],
    type: 'Web Development',
    link: 'https://github.com/TuyenTran205/duAnWebGioiThieuCN'
  }
];
