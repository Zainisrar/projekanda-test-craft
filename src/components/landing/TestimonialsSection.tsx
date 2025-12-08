import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Users, FileCheck, BookOpen } from 'lucide-react';

export interface Testimonial {
  quote: string;
  name: string;
  role: string;
  avatar?: string;
}

export interface Statistic {
  value: string;
  label: string;
  icon: React.ReactNode;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    quote: "JobFinder helped me identify my skill gaps and recommended courses that perfectly matched my career goals. I landed my dream job within 3 months!",
    name: "Sarah Johnson",
    role: "TVET Graduate, Engineering",
  },
  {
    quote: "The AI-powered assessments are incredibly accurate. They helped me understand exactly where I needed to improve to advance in my career.",
    name: "Michael Chen",
    role: "ADOF Professional, IT Sector",
  },
  {
    quote: "As an educator, I recommend JobFinder to all my students. The personalized approach makes a real difference in their learning journey.",
    name: "Dr. Emily Williams",
    role: "TVET Instructor",
  },
];

export const STATISTICS: Statistic[] = [
  {
    value: "10,000+",
    label: "Active Users",
    icon: <Users className="w-6 h-6" />,
  },
  {
    value: "50,000+",
    label: "Assessments Completed",
    icon: <FileCheck className="w-6 h-6" />,
  },
  {
    value: "5,000+",
    label: "Course Recommendations",
    icon: <BookOpen className="w-6 h-6" />,
  },
];

export interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  statistics?: Statistic[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials = TESTIMONIALS,
  statistics = STATISTICS,
}) => {
  return (
    <section id="testimonials" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Users Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of learners and professionals who have transformed 
            their careers with JobFinder.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-muted/30 rounded-2xl"
              data-testid={`statistic-${index}`}
            >
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mx-auto mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="bg-card/50 border-border/50"
              data-testid={`testimonial-card-${index}`}
            >
              <CardContent className="p-6">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p
                  className="text-foreground mb-6 leading-relaxed"
                  data-testid={`testimonial-quote-${index}`}
                >
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div
                      className="font-medium text-foreground"
                      data-testid={`testimonial-name-${index}`}
                    >
                      {testimonial.name}
                    </div>
                    <div
                      className="text-sm text-muted-foreground"
                      data-testid={`testimonial-role-${index}`}
                    >
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
