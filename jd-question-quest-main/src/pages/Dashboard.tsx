import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Navigation } from '@/components/Navigation';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, FileText, GraduationCap, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Question {
  id: string;
  question: string;
  question_type: 'interview' | 'quiz';
  options?: any;
  correct_answer?: string;
}

interface JobDescription {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [savedJobs, setSavedJobs] = useState<JobDescription[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      loadSavedJobs();
    }
  }, [user]);

  const loadSavedJobs = async () => {
    const { data, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading jobs:', error);
    } else {
      setSavedJobs(data || []);
    }
  };

  const handleGenerate = async (type: 'interview' | 'quiz') => {
    if (!jobDescription.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a job description',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Save job description
      const { data: jobData, error: jobError } = await supabase
        .from('job_descriptions')
        .insert({
          title: jobTitle || 'Untitled Job',
          description: jobDescription,
          user_id: user!.id,
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Generate questions
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: { jobDescription, questionType: type },
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      const generatedQuestions = data.questions;

      // Save questions to database
      const questionsToInsert = generatedQuestions.map((q: any) => ({
        job_description_id: jobData.id,
        user_id: user!.id,
        question_type: type,
        question: typeof q === 'string' ? q : q.question,
        options: typeof q === 'object' ? q.options : null,
        correct_answer: typeof q === 'object' ? q.correctAnswer : null,
      }));

      const { error: insertError } = await supabase
        .from('generated_questions')
        .insert(questionsToInsert);

      if (insertError) throw insertError;

      // Load questions
      const { data: loadedQuestions, error: loadError } = await supabase
        .from('generated_questions')
        .select('*')
        .eq('job_description_id', jobData.id)
        .eq('question_type', type);

      if (loadError) throw loadError;

      setQuestions((loadedQuestions || []) as Question[]);
      loadSavedJobs();

      toast({
        title: 'Success',
        description: `Generated ${generatedQuestions.length} ${type} questions`,
      });
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    const { error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', jobId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete job',
        variant: 'destructive',
      });
    } else {
      loadSavedJobs();
      toast({
        title: 'Success',
        description: 'Job deleted successfully',
      });
    }
  };

  const loadQuestions = async (jobId: string, type: 'interview' | 'quiz') => {
    const { data, error } = await supabase
      .from('generated_questions')
      .select('*')
      .eq('job_description_id', jobId)
      .eq('question_type', type);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } else {
      setQuestions((data || []) as Question[]);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Generate customized interview questions and practice quizzes
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Create New Job Questions</CardTitle>
                <CardDescription>
                  Enter a job description to generate questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title (Optional)</Label>
                  <Input
                    id="jobTitle"
                    placeholder="e.g. Senior Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobDescription">Job Description</Label>
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={10}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleGenerate('interview')}
                    disabled={loading}
                    className="flex-1 gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    Generate Interview Questions
                  </Button>
                  <Button
                    onClick={() => handleGenerate('quiz')}
                    disabled={loading}
                    variant="secondary"
                    className="flex-1 gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <GraduationCap className="w-4 h-4" />
                    )}
                    Generate Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-border/50">
              <CardHeader>
                <CardTitle>Saved Job Descriptions</CardTitle>
                <CardDescription>
                  View your previously generated questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {savedJobs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      No saved jobs yet. Generate your first set of questions!
                    </p>
                  ) : (
                    savedJobs.map((job) => (
                      <div
                        key={job.id}
                        className="p-4 border border-border rounded-lg hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold">{job.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {job.description}
                            </p>
                            <div className="flex gap-2 mt-3">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadQuestions(job.id, 'interview')}
                              >
                                View Interview
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => loadQuestions(job.id, 'quiz')}
                              >
                                View Quiz
                              </Button>
                            </div>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="shadow-lg border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle>Generated Questions</CardTitle>
                <CardDescription>
                  {questions.length > 0
                    ? `${questions.length} questions generated`
                    : 'Questions will appear here'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {questions.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Generate questions to see them here
                    </p>
                  ) : questions[0].question_type === 'interview' ? (
                    questions.map((q, index) => (
                      <div
                        key={q.id}
                        className="p-4 border border-border rounded-lg bg-card/50"
                      >
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Question {index + 1}
                        </p>
                        <p>{q.question}</p>
                      </div>
                    ))
                  ) : (
                    questions.map((q, index) => (
                      <div
                        key={q.id}
                        className="p-4 border border-border rounded-lg bg-card/50"
                      >
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Question {index + 1}
                        </p>
                        <p className="mb-3">{q.question}</p>
                        {q.options && (
                          <div className="space-y-2">
                            {(q.options as string[]).map((option, i) => (
                              <div
                                key={i}
                                className={`p-2 rounded border ${
                                  option === q.correct_answer
                                    ? 'bg-primary/10 border-primary'
                                    : 'border-border'
                                }`}
                              >
                                {option}
                                {option === q.correct_answer && (
                                  <span className="ml-2 text-xs text-primary font-medium">
                                    ✓ Correct
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}