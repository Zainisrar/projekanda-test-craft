import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GraduationCap, Briefcase, CheckCircle, ArrowRight } from 'lucide-react';

export interface UserType {
  title: string;
  description: string;
  benefits: string[];
  icon: React.ReactNode;
}

export const USER_TYPES: UserType[] = [
  {
    title: 'TVET Students',
    description: 'Technical and vocational education students aged 18-25 seeking skill assessment and career preparation.',
    benefits: [
      'Personalized skill assessments',
      'Course recommendations based on interests',
      'Progress tracking and analytics',
      'Career readiness evaluation',
    ],
    icon: <GraduationCap className="w-8 h-8" />,
  },
  {
    title: 'ADOF Professionals',
    description: 'Working professionals aged 25-45 seeking career advancement and skill development opportunities.',
    benefits: [
      'Job-specific competency tests',
      'Career path recommendations',
      'Professional skill gap analysis',
      'Industry-aligned assessments',
    ],
    icon: <Briefcase className="w-8 h-8" />,
  },
];

export interface WhoItsForSectionProps {
  userTypes?: UserType[];
  onGetStarted: () => void;
}

export const WhoItsForSection: React.FC<WhoItsForSectionProps> = ({
  userTypes = USER_TYPES,
  onGetStarted,
}) => {
  return (
    <section id="who-its-for" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Who It's For
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform is designed to serve two distinct groups with tailored 
            experiences for their unique needs.
          </p>
        </div>

        {/* User Type Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {userTypes.map((userType, index) => (
            <Card
              key={index}
              className="bg-card border-border/50 hover:border-primary/50 hover:shadow-xl transition-all duration-300"
              data-testid={`user-type-card-${index}`}
            >
              <CardContent className="p-8">
                {/* Icon */}
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                  {userType.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-2xl font-bold text-foreground mb-3"
                  data-testid={`user-type-title-${index}`}
                >
                  {userType.title}
                </h3>

                {/* Description */}
                <p
                  className="text-muted-foreground mb-6"
                  data-testid={`user-type-description-${index}`}
                >
                  {userType.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-3 mb-8" data-testid={`user-type-benefits-${index}`}>
                  {userType.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  onClick={onGetStarted}
                  className="w-full group"
                  size="lg"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
