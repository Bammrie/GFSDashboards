export type StepType = 'singleChoice' | 'text' | 'number' | 'date' | 'select' | 'contact' | 'review' | 'completion';

export interface QuestionStep {
  id: string;
  title: string;
  question: string;
  type: StepType;
  options?: string[];
  placeholder?: string;
  fields?: Array<{ id: string; label: string; type: 'text' | 'email' | 'tel' }>;
  validate?: (value: unknown, app: LoanApplication) => string | null;
  next?: string | ((app: LoanApplication) => string);
}

export type LoanApplication = Record<string, string>;
