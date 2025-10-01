import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Sparkles, Target, Zap, FileText, GraduationCap } from 'lucide-react';
import { useEffect } from 'react';
import heroBg from '@/assets/hero-bg.jpg';

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${heroBg})` }}
        />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Interview Preparation
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                Master Your Next
              </span>
              <br />
              Job Interview
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Generate 200+ customized interview questions and practice quizzes tailored to any job description.
              Prepare smarter, perform better.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/auth')}
                className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <Brain className="w-5 h-5" />
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="gap-2 text-lg px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Ace Your Interview
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powered by advanced AI to give you the most relevant and comprehensive preparation
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>200+ Interview Questions</CardTitle>
                <CardDescription>
                  Get comprehensive interview questions covering technical skills, behavioral scenarios, and role-specific competencies
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <CardTitle>Practice Quizzes</CardTitle>
                <CardDescription>
                  Test your knowledge with 200+ multiple-choice questions designed to reinforce key concepts and skills
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle>Instant AI Generation</CardTitle>
                <CardDescription>
                  Powered by advanced AI models to analyze job descriptions and generate highly relevant questions in seconds
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-card/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Simple, Fast, Effective
            </h2>
            <p className="text-xl text-muted-foreground">
              Get started in just three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Paste Job Description',
                description: 'Copy and paste the job description from any job posting',
                icon: FileText,
              },
              {
                step: '02',
                title: 'Generate Questions',
                description: 'Our AI analyzes the JD and creates 200+ tailored questions',
                icon: Brain,
              },
              {
                step: '03',
                title: 'Practice & Prepare',
                description: 'Review questions and take quizzes to master your interview',
                icon: Target,
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground">
                  {item.step}
                </div>
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="max-w-4xl mx-auto border-border/50 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-br from-primary to-accent p-12 text-center text-primary-foreground">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Ready to Ace Your Interview?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of job seekers who are preparing smarter with AI-powered questions
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/auth')}
                className="gap-2 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                <Brain className="w-5 h-5" />
                Start Preparing Now
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>&copy; 2025 JobQuestionGenerator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
