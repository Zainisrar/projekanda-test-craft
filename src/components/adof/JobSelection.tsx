import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Briefcase, Search, MapPin, Clock, DollarSign, ChevronRight } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  requirements: string[];
  skills: string[];
}

interface JobSelectionProps {
  onJobSelect: (job: Job) => void;
}

export const JobSelection: React.FC<JobSelectionProps> = ({ onJobSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock job data - in real app, this would come from an API
  const jobs: Job[] = [
    {
      id: '1',
      title: 'Software Developer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      type: 'Full-time',
      salary: '$60,000 - $80,000',
      description: 'We are looking for a skilled software developer to join our team. You will be responsible for developing and maintaining web applications using modern technologies.',
      requirements: [
        'Bachelor\'s degree in Computer Science or related field',
        '2+ years of experience in software development',
        'Strong problem-solving skills',
        'Excellent communication skills'
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL']
    },
    {
      id: '2',
      title: 'Digital Marketing Specialist',
      company: 'Marketing Pro Agency',
      location: 'New York, NY',
      type: 'Full-time',
      salary: '$45,000 - $65,000',
      description: 'Join our dynamic marketing team to create and execute digital marketing campaigns that drive brand awareness and customer engagement.',
      requirements: [
        'Bachelor\'s degree in Marketing or related field',
        '1+ years of digital marketing experience',
        'Knowledge of SEO and social media marketing',
        'Creative thinking and analytical skills'
      ],
      skills: ['SEO', 'Social Media', 'Google Analytics', 'Content Marketing', 'PPC']
    },
    {
      id: '3',
      title: 'Data Analyst',
      company: 'Data Insights Corp',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$55,000 - $75,000',
      description: 'Analyze complex datasets to provide actionable insights that drive business decisions. Work with cross-functional teams to identify trends and opportunities.',
      requirements: [
        'Bachelor\'s degree in Statistics, Mathematics, or related field',
        '2+ years of data analysis experience',
        'Proficiency in SQL and Python/R',
        'Strong attention to detail'
      ],
      skills: ['SQL', 'Python', 'R', 'Excel', 'Tableau', 'Statistics']
    },
    {
      id: '4',
      title: 'Project Manager',
      company: 'Global Solutions Ltd',
      location: 'Chicago, IL',
      type: 'Full-time',
      salary: '$70,000 - $90,000',
      description: 'Lead cross-functional teams to deliver projects on time and within budget. Coordinate with stakeholders and ensure project objectives are met.',
      requirements: [
        'Bachelor\'s degree in Business or related field',
        '3+ years of project management experience',
        'PMP certification preferred',
        'Strong leadership and communication skills'
      ],
      skills: ['Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication']
    },
    {
      id: '5',
      title: 'UX/UI Designer',
      company: 'Creative Design Studio',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      salary: '$50,000 - $70,000',
      description: 'Design intuitive and engaging user experiences for web and mobile applications. Collaborate with developers and product managers to bring designs to life.',
      requirements: [
        'Bachelor\'s degree in Design or related field',
        '2+ years of UX/UI design experience',
        'Proficiency in design tools (Figma, Sketch, Adobe)',
        'Strong portfolio demonstrating design skills'
      ],
      skills: ['Figma', 'Sketch', 'Adobe Creative Suite', 'Prototyping', 'User Research']
    },
    {
      id: '6',
      title: 'Sales Representative',
      company: 'Sales Excellence Inc',
      location: 'Miami, FL',
      type: 'Full-time',
      salary: '$40,000 - $60,000 + Commission',
      description: 'Drive revenue growth by identifying and pursuing new business opportunities. Build relationships with clients and provide exceptional customer service.',
      requirements: [
        'High school diploma or equivalent',
        '1+ years of sales experience',
        'Excellent interpersonal skills',
        'Goal-oriented and self-motivated'
      ],
      skills: ['Sales', 'Customer Service', 'CRM', 'Negotiation', 'Communication']
    }
  ];

  const categories = [
    { key: 'all', label: 'All Jobs' },
    { key: 'technology', label: 'Technology' },
    { key: 'marketing', label: 'Marketing' },
    { key: 'business', label: 'Business' },
    { key: 'design', label: 'Design' },
    { key: 'sales', label: 'Sales' }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    
    // Simple category matching based on job title/skills
    const categoryMatch = {
      technology: ['software', 'developer', 'data', 'analyst'],
      marketing: ['marketing', 'seo', 'social'],
      business: ['project', 'manager', 'business'],
      design: ['designer', 'ux', 'ui'],
      sales: ['sales', 'representative']
    };
    
    const keywords = categoryMatch[selectedCategory as keyof typeof categoryMatch] || [];
    const matchesCategory = keywords.some(keyword => 
      job.title.toLowerCase().includes(keyword) || 
      job.skills.some(skill => skill.toLowerCase().includes(keyword))
    );
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>Available Positions</span>
          </CardTitle>
          <CardDescription>
            Select a job position to begin your assessment process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search jobs by title, company, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.key}
                variant={selectedCategory === category.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Job Listings */}
      <div className="grid gap-4">
        {filteredJobs.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No jobs found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-1">{job.title}</h3>
                    <p className="text-muted-foreground font-medium">{job.company}</p>
                  </div>
                  <Button onClick={() => onJobSelect(job)} className="ml-4">
                    Select Job
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{job.salary}</span>
                  </div>
                </div>

                <p className="text-foreground mb-4 line-clamp-2">{job.description}</p>

                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Required Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="font-semibold text-foreground">{jobs.length}</div>
              <div>Total Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{filteredJobs.length}</div>
              <div>Matching Jobs</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">{categories.length - 1}</div>
              <div>Categories</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};