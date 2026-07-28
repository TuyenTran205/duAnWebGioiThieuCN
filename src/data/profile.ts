export interface Profile {
  name: string;
  university: string;
  roles: string[];
  bio: string;
  skills: string[];
}

export const userProfile: Profile = {
  name: 'Tran Van Tuyen',
  university: 'Thuy Loi University (TLU)',
  roles: [
    'IT Student',
    'Aspiring Business Analyst',
    'Machine Learning Enthusiast'
  ],
  bio: 'A passionate IT student at Thuy Loi University, focused on software development, business analysis, and machine learning solutions.',
  skills: [
    'Java',
    'C++',
    'PHP',
    'Flutter',
    'Firebase',
    'Cloudflare Workers AI',
    'React',
    'TypeScript'
  ]
};
