import { QuestionStep } from '../types/application';

const isAtLeast18 = (value: string) => {
  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  const eighteenthBirthday = new Date(
    birthDate.getFullYear() + 18,
    birthDate.getMonth(),
    birthDate.getDate()
  );

  return today >= eighteenthBirthday;
};

export const loanFlow: QuestionStep[] = [
  {
    id: 'loanPurpose',
    title: 'Buying New Vehicle',
    question: 'Type Of Loan',
    type: 'singleChoice',
    options: [
      'Buying New Vehicle',
      'Buying Used Vehicle',
      'Refinancing Existing Vehicle',
      'Personal Loan',
      'Other'
    ],
    next: (application) =>
      application.loanPurpose.includes('Vehicle') ? 'vehicleType' : 'loanAmount'
  },
  {
    id: 'vehicleType',
    title: 'Vehicle Loan',
    question: 'Vehicle Type',
    type: 'singleChoice',
    options: ['New Car Purchase', 'Used Car Purchase'],
    next: 'loanAmount'
  },
  {
    id: 'loanAmount',
    title: 'Loan Details',
    question: 'Loan amount requested',
    type: 'number',
    placeholder: '$0.00',
    next: (application) =>
      application.loanPurpose.includes('Vehicle') ? 'knowsVin' : 'downPayment'
  },
  {
    id: 'knowsVin',
    title: 'Loan Details',
    question: 'Do you know the VIN?',
    type: 'singleChoice',
    options: ['Yes', 'No'],
    next: (application) => (application.knowsVin === 'Yes' ? 'vin' : 'downPayment')
  },
  {
    id: 'vin',
    title: 'Loan Details',
    question: 'Enter the VIN',
    type: 'text',
    next: 'downPayment'
  },
  {
    id: 'downPayment',
    title: 'Loan Details',
    question: 'Down payment',
    type: 'number',
    placeholder: '$0.00',
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
