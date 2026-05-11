import { QuestionStep } from '../types/application';

const isAtLeast18 = (value: string) => {
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age >= 18;
};

export const loanFlow: QuestionStep[] = [
  {
    id: 'loanType',
    title: 'Loan Details',
    question: 'What type of loan are you applying for?',
    type: 'singleChoice',
    options: ['Auto Loan', 'Personal Loan', 'Recreational Vehicle', 'Other'],
    next: 'loanAmount'
  },
  {
    id: 'loanAmount',
    title: 'Loan Details',
    question: 'How much would you like to borrow?',
    type: 'number',
    placeholder: '$0.00',
    next: 'purchaseType'
  },
  {
    id: 'purchaseType',
    title: 'Loan Details',
    question: 'Is this a new purchase or refinance?',
    type: 'singleChoice',
    options: ['New Purchase', 'Refinance'],
    next: 'tradeIn'
  },
  {
    id: 'tradeIn',
    title: 'Loan Details',
    question: 'Do you have a trade-in?',
    type: 'singleChoice',
    options: ['Yes', 'No'],
    next: 'name'
  },
  {
    id: 'name',
    title: 'Applicant Information',
    question: 'What is your name?',
    type: 'contact',
    fields: [
      { id: 'firstName', label: 'First Name', type: 'text' },
      { id: 'lastName', label: 'Last Name', type: 'text' }
    ],
    next: 'dob'
  },
  {
    id: 'dob',
    title: 'Applicant Information',
    question: 'Date of birth',
    type: 'date',
    validate: (value) =>
      isAtLeast18(String(value ?? '')) ? null : 'Applicants must be at least 18 years old.',
    next: 'email'
  },
  {
    id: 'email',
    title: 'Applicant Information',
    question: 'Email address',
    type: 'text',
    validate: (value) =>
      /.+@.+\..+/.test(String(value ?? '')) ? null : 'Enter a valid email address.',
    next: 'phone'
  },
  {
    id: 'phone',
    title: 'Applicant Information',
    question: 'Mobile phone number',
    type: 'text',
    next: 'address'
  },
  {
    id: 'address',
    title: 'Applicant Information',
    question: 'Street address',
    type: 'text',
    next: 'employment'
  },
  {
    id: 'employment',
    title: 'Employment',
    question: 'Employment status',
    type: 'select',
    options: ['Employed', 'Self-employed', 'Retired', 'Student', 'Other'],
    next: 'income'
  },
  {
    id: 'income',
    title: 'Employment',
    question: 'Monthly income',
    type: 'number',
    placeholder: '$0.00',
    next: 'review'
  },
  {
    id: 'review',
    title: 'Review Application',
    question: 'Please review your application',
    type: 'review',
    next: 'completion'
  },
  {
    id: 'completion',
    title: 'Application Submitted',
    question: 'Thank you!',
    type: 'completion'
  }
];
