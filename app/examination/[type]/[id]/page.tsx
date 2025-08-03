'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Header } from '@/components/common/Header';
import { BottomNavigation } from '@/components/common/BottomNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle,
  AlertCircle,
  User,
  Baby
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motherService, childService, examinationService } from '@/lib/database';

interface Person {
  id: string;
  name: string;
  type: 'mother' | 'child';
}

interface ExaminationQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'radio';
  options?: string[];
  unit?: string;
}

const CHILD_QUESTIONS: ExaminationQuestion[] = [
  {
    id: 'height',
    question: 'What is the child\'s height?',
    type: 'number',
    unit: 'cm'
  },
  {
    id: 'weight',
    question: 'What is the child\'s weight?',
    type: 'number',
    unit: 'kg'
  },
  {
    id: 'feeding',
    question: 'Is the child fed properly?',
    type: 'radio',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'vaccination',
    question: 'Has the child been vaccinated on schedule?',
    type: 'radio',
    options: ['Yes', 'No', 'Partially']
  },
  {
    id: 'fever',
    question: 'Has the child had frequent fevers in the last month?',
    type: 'radio',
    options: ['Yes', 'No', 'Occasionally']
  }
];

const MOTHER_QUESTIONS: ExaminationQuestion[] = [
  {
    id: 'weight',
    question: 'What is your current weight?',
    type: 'number',
    unit: 'kg'
  },
  {
    id: 'chronic_conditions',
    question: 'Do you have any chronic health conditions?',
    type: 'radio',
    options: ['Yes', 'No', 'Not sure']
  },
  {
    id: 'complications',
    question: 'Are you experiencing any pregnancy complications?',
    type: 'radio',
    options: ['Yes', 'No', 'Minor issues']
  },
  {
    id: 'vitamins',
    question: 'Have you been taking prenatal vitamins regularly?',
    type: 'radio',
    options: ['Yes', 'No', 'Sometimes']
  },
  {
    id: 'symptoms',
    question: 'Are you experiencing any unusual symptoms?',
    type: 'radio',
    options: ['Yes', 'No', 'Mild symptoms']
  }
];

export default function ExaminationPage({ params }: { params: { type: string; id: string } }) {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const { type, id } = params;

  const [person, setPerson] = useState<Person | null>(null);
  const [loadingPerson, setLoadingPerson] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  const questions = type === 'child' ? CHILD_QUESTIONS : MOTHER_QUESTIONS;

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const loadPerson = async () => {
      if (!id || !type) return;
      try {
        setLoadingPerson(true);
        let personData;
        if (type === 'mother') {
          personData = await motherService.getById(id);
          if (personData) {
            setPerson({
              id: personData.id,
              name: personData.name,
              type: 'mother',
            });
          }
        } else if (type === 'child') {
          personData = await childService.getById(id);
          if (personData) {
            setPerson({
              id: personData.id,
              name: personData.name,
              type: 'child',
            });
          }
        }
      } catch (error) {
        console.error('Error loading person:', error);
      } finally {
        setLoadingPerson(false);
      }
    };
    loadPerson();
  }, [id, type]);

  const handleAnswer = (answer: any) => {
    const questionId = questions[currentQuestion].id;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // Calculate BMI and health status
      let bmi = null;
      let bmiCategory = null;
      let healthStatus: 'healthy' | 'needs_attention' | 'critical' = 'healthy';

      if (type === 'child' && answers.height && answers.weight) {
        const bmiResult = examinationService.calculateChildBMI(
          parseFloat(answers.weight), 
          parseFloat(answers.height)
        );
        bmi = bmiResult.bmi;
        bmiCategory = bmiResult.category;
      } else if (type === 'mother' && answers.weight) {
        // For mothers, we need height from the mother's data
        const motherData = await motherService.getById(id);
        if (motherData && motherData.age) {
          // Estimate height based on age (simplified approach)
          const estimatedHeight = 160; // Average height in cm
          const bmiResult = examinationService.calculateMotherBMI(
            parseFloat(answers.weight), 
            estimatedHeight
          );
          bmi = bmiResult.bmi;
          bmiCategory = bmiResult.category;
        }
      }

      // Determine health status
      healthStatus = examinationService.determineHealthStatus(answers, bmiCategory || 'normal', type as 'mother' | 'child');

      // Create examination data
      const examinationData = {
        person_id: person!.id,
        person_type: person!.type,
        answers,
        bmi: bmi || undefined,
        bmi_category: bmiCategory || undefined,
        health_status: healthStatus,
        notes: `Examination completed on ${new Date().toLocaleDateString()}`
      };

      // Save to database
      const savedExamination = await examinationService.create(examinationData);

      if (savedExamination) {
        console.log('✅ Examination saved successfully:', savedExamination.id);
        
        // Show results summary
        const bmiMessage = bmi ? `BMI: ${bmi} (${bmiCategory})` : 'BMI: Not calculated';
        const healthMessage = `Health Status: ${healthStatus.replace('_', ' ')}`;
        
        alert(`Examination completed successfully!\n\n${bmiMessage}\n${healthMessage}`);
        router.back();
      } else {
        console.error('❌ Failed to save examination');
        alert('Failed to save examination results. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error submitting examination:', error);
      alert('An error occurred while submitting the examination results.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPerson) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading examination...</p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
          <div className="text-center text-red-600 font-semibold">
            Person not found.
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Conduct Examination - {person.name}
          </h1>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Question {currentQuestion + 1}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {currentQ.question}
              </h3>

              {/* Answer Input */}
              {currentQ.type === 'text' && (
                <Input
                  value={answers[currentQ.id] || ''}
                  onChange={(e) => handleAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="w-full"
                />
              )}

              {currentQ.type === 'number' && (
                <div className="space-y-2">
                  <Input
                    type="number"
                    value={answers[currentQ.id] || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    placeholder={`Enter ${currentQ.unit || 'value'}...`}
                    className="w-full"
                  />
                  {currentQ.unit && (
                    <span className="text-sm text-gray-500">Unit: {currentQ.unit}</span>
                  )}
                </div>
              )}

              {currentQ.type === 'radio' && currentQ.options && (
                <RadioGroup
                  value={answers[currentQ.id] || ''}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {currentQ.options.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={option} />
                      <Label htmlFor={option} className="text-sm font-medium">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Previous
              </Button>

              {currentQuestion === questions.length - 1 ? (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || Object.keys(answers).length < questions.length}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Examination
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQ.id]}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next
                </Button>
              )}
            </div>

            {/* Answer Summary */}
            {Object.keys(answers).length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Answered Questions:</h4>
                <div className="space-y-1">
                  {questions.map((q, index) => (
                    <div key={q.id} className="flex items-center space-x-2 text-sm">
                      {answers[q.id] ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className={answers[q.id] ? 'text-gray-900' : 'text-gray-500'}>
                        {q.question}
                      </span>
                      {answers[q.id] && (
                        <span className="text-blue-600 font-medium">
                          ({answers[q.id]})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
} 