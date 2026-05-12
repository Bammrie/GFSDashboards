import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import ProgressIndicator from './ProgressIndicator';
import StepCard from './StepCard';

type IntakeStep = 'licenseFront' | 'licenseBack' | 'loanAmount' | 'waiting';

const stepOrder: IntakeStep[] = ['licenseFront', 'licenseBack', 'loanAmount', 'waiting'];

const formatCurrency = (value: string) =>
  value.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const isLikelyMobile = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

export default function LoanWizard() {
  const [currentStep, setCurrentStep] = useState<IntakeStep>('licenseFront');
  const [frontLicense, setFrontLicense] = useState<File | null>(null);
  const [backLicense, setBackLicense] = useState<File | null>(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [error, setError] = useState('');
  const [mobileCameraPrompt, setMobileCameraPrompt] = useState(false);

  useEffect(() => setMobileCameraPrompt(isLikelyMobile()), []);

  const progressIndex = stepOrder.findIndex((step) => step === currentStep) + 1;
  const selectedFile = currentStep === 'licenseFront' ? frontLicense : backLicense;

  const copy = useMemo(() => {
    if (currentStep === 'licenseFront') {
      return {
        title: "Upload Driver's License",
        question: "Let's start with the front of your driver's license.",
        help: 'Use a clear, well-lit photo so we can read the name, address, date of birth, and license details.'
      };
    }

    if (currentStep === 'licenseBack') {
      return {
        title: "Upload Driver's License",
        question: "Now upload the back of your driver's license.",
        help: 'The barcode side helps us pull structured identity data quickly and reduce manual typing.'
      };
    }

    if (currentStep === 'loanAmount') {
      return {
        title: 'Loan Amount',
        question: 'How much would you like to borrow?',
        help: 'Enter the requested amount and we will start the conditional decision process.'
      };
    }

    return {
      title: 'Application Submitted',
      question: 'We will have your conditional approval/rejection in just a few moments.',
      help: 'Please keep this page open while we prepare the next step.'
    };
  }, [currentStep]);

  const onFileChange =
    (side: 'front' | 'back') =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setError('');
      if (side === 'front') {
        setFrontLicense(file);
      } else {
        setBackLicense(file);
      }
    };

  const goNext = () => {
    setError('');

    if (currentStep === 'licenseFront') {
      if (!frontLicense) return setError("Upload the front of your driver's license to continue.");
      return setCurrentStep('licenseBack');
    }

    if (currentStep === 'licenseBack') {
      if (!backLicense) return setError("Upload the back of your driver's license to continue.");
      return setCurrentStep('loanAmount');
    }

    if (currentStep === 'loanAmount') {
      if (!loanAmount) return setError('Enter a loan amount to submit.');
      console.log('loanApplicationPrototype payload', {
        loanAmount,
        licenseFrontFileName: frontLicense?.name ?? null,
        licenseBackFileName: backLicense?.name ?? null
      });
      return setCurrentStep('waiting');
    }
  };

  const goBack = () => {
    setError('');
    if (currentStep === 'licenseBack') setCurrentStep('licenseFront');
    if (currentStep === 'loanAmount') setCurrentStep('licenseBack');
  };

  const renderLicenseUpload = (side: 'front' | 'back') => (
    <>
      {mobileCameraPrompt && (
        <p className="text-center text-sm text-gray-600">
          When prompted, allow camera access so you can take the photo now.
        </p>
      )}
      <label className="w-full border-2 border-dashed border-gray-200 rounded-3xl p-8 text-center bg-gray-50 cursor-pointer hover:border-burgundy transition">
        <span className="block text-sm font-semibold text-burgundy">Upload Your Driver&apos;s License</span>
        <span className="block text-xs text-gray-500 mt-2">
          {selectedFile ? selectedFile.name : `${side === 'front' ? 'Front' : 'Back'} photo or image file`}
        </span>
        <input
          className="hidden"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFileChange(side)}
        />
      </label>
      <button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={goNext}>
        Continue
      </button>
    </>
  );

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      {currentStep !== 'waiting' && <ProgressIndicator current={progressIndex} total={stepOrder.length} />}
      <StepCard title={copy.title}>
        <p className="text-center text-xl mb-3">{copy.question}</p>
        <p className="text-center text-sm text-gray-600 mb-6">{copy.help}</p>
        <div className="flex flex-col items-center gap-3">
          {currentStep === 'licenseFront' && renderLicenseUpload('front')}
          {currentStep === 'licenseBack' && renderLicenseUpload('back')}

          {currentStep === 'loanAmount' && (
            <>
              <input
                className="w-full border rounded-xl p-3 text-center text-xl font-semibold"
                inputMode="numeric"
                placeholder="$0.00"
                value={loanAmount}
                onChange={(event) => setLoanAmount(formatCurrency(event.target.value))}
                onKeyDown={(event) => event.key === 'Enter' && goNext()}
              />
              <button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={goNext}>
                Submit
              </button>
            </>
          )}

          {currentStep === 'waiting' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="h-14 w-14 rounded-full border-4 border-gray-200 border-t-burgundy animate-spin" />
              <p className="text-sm text-gray-500 text-center">
                We are reviewing the license images and requested amount.
              </p>
            </div>
          )}

          {!!error && <p className="text-red-600 text-sm">{error}</p>}

          {(currentStep === 'licenseBack' || currentStep === 'loanAmount') && (
            <button className="text-sm text-gray-500" onClick={goBack}>Back</button>
          )}
        </div>
      </StepCard>
    </div>
  );
}
