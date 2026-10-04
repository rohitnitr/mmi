export type Career = { id: string; name: string; roles: string[]; skills: string[] }

export const careers: Career[] = [
  { id: 'software', name: 'Software Engineering', roles: ['Software Engineer', 'Frontend Developer', 'Backend Developer', 'Full Stack Developer'], skills: ['React', 'Node.js', 'System Design'] },
  { id: 'data', name: 'Data & Analytics', roles: ['Data Analyst', 'Data Scientist', 'Business Analyst'], skills: ['SQL', 'Python', 'Analytics'] },
  { id: 'consulting', name: 'Consulting', roles: ['Strategy Consultant', 'Management Consultant', 'Business Consultant'], skills: ['Case Interviews', 'Strategy', 'Problem Solving'] },
  { id: 'finance', name: 'Finance', roles: ['Financial Analyst', 'Investment Banking', 'Risk Analyst'], skills: ['Excel', 'Financial Modeling', 'Valuation'] },
  { id: 'product', name: 'Product', roles: ['Product Manager', 'Product Analyst'], skills: ['Product Sense', 'Metrics', 'Prioritization'] },
  { id: 'government', name: 'Government', roles: ['Civil Services', 'PSU', 'Public Sector roles'], skills: ['Reasoning', 'Aptitude', 'General Studies'] },
  { id: 'marketing', name: 'Marketing', roles: ['Digital Marketing', 'Growth', 'Brand Marketing'], skills: ['SEO', 'Analytics', 'Brand Strategy'] },
]
