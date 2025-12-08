import React from 'react';
import { UserPlus, ClipboardCheck, BarChart3, GraduationCap } from 'lucide-react';

export interface Step {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export const STEPS: Step[] = [
  {
    number: 1,
    icon: <UserPlus className="w-6 h-6" />,
    title: 'Register',
    description: 'Create your account and select your role as a TVET student or ADOF professional.',
  },
  {
    number: 2,
    icon: <ClipboardCheck className="w-6 h-6" />,
    title: 'Take Assessment',
    description: 'Complete AI-generated personalized tests tailored to your interests and career goals.',
  },
  {
    number: 3,
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Get Results',
    description: 'Receive detailed analysis with percentage scores and skill breakdown insights.',
  },
  {
    number: 4,
    icon: <GraduationCap className="w-6 h-6" />,
    title: 'Recommendations',
    description: 'Get personalized course and career guidance based on your assessment results.',
  },
];

export interface HowItWorksSectionProps {
  steps?: Step[];
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({
  steps = STEPS,
}) => {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in just four simple steps and begin your journey 
            to skill development and career advancement.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col items-center text-center group"
                data-testid={`step-${index}`}
              >
                {/* Step Number Badge */}
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold z-10"
                  data-testid={`step-number-${index}`}
                >
                  {step.number}
                </div>

                {/* Icon Container */}
                <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                  <span data-testid={`step-icon-${index}`}>{step.icon}</span>
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-semibold text-foreground mb-2"
                  data-testid={`step-title-${index}`}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm text-muted-foreground leading-relaxed"
                  data-testid={`step-description-${index}`}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
