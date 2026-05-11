import { useEffect, useMemo, useState } from 'react';
import { loanFlow } from '../data/loanFlow';
import { LoanApplication } from '../types/application';
import ChoiceButton from './ChoiceButton';
import ProgressIndicator from './ProgressIndicator';
import StepCard from './StepCard';
import ReviewApplication from './ReviewApplication';

const formatCurrency = (value: string) =>
  value.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const readStoredJson = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || '') as T;
  } catch {
    return fallback;
  }
};

export default function LoanWizard() {
  const [application, setApplication] = useState<LoanApplication>(() => readStoredJson('loanApp', {}));
  const [currentId, setCurrentId] = useState(localStorage.getItem('loanStep') || loanFlow[0].id);
  const [stepHistory, setStepHistory] = useState<string[]>(() => readStoredJson('loanStepHistory', []));
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const step = useMemo(() => loanFlow.find((item) => item.id === currentId) || loanFlow[0], [currentId]);

  useEffect(() => {
    localStorage.setItem('loanApp', JSON.stringify(application));
    localStorage.setItem('loanStep', currentId);
  }, [application, currentId]);

  useEffect(() => {
    localStorage.setItem('loanStepHistory', JSON.stringify(stepHistory));
  }, [stepHistory]);

  useEffect(() => {
    if (step.id !== currentId) {
      setCurrentId(step.id);
    }
  }, [currentId, step.id]);

  useEffect(() => setInput(application[step.id] || ''), [step.id, application]);

  const goToStep = (nextId?: string) => {
    if (!nextId) return;
    setStepHistory((history) => [...history, currentId]);
    setCurrentId(nextId);
  };

  const goBack = () => {
    setError('');
    setStepHistory((history) => {
      const previousId = history[history.length - 1];
      if (previousId) {
        setCurrentId(previousId);
      }
      return history.slice(0, -1);
    });
  };

  const resetApplication = () => {
    setApplication({});
    setStepHistory([]);
    setCurrentId(loanFlow[0].id);
    setError('');
  };

  const goNext = async (value?: string) => {
    const final = value ?? input;

    if (step.type !== 'review' && step.type !== 'completion' && !final) {
      return setError('This field is required.');
    }

    if (step.validate) {
      const message = step.validate(final, application);
      if (message) return setError(message);
    }

    setError('');

    if (step.id === 'review') {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 900));
      console.log('submitApplication payload', application);
      setLoading(false);
      goToStep('completion');
      return;
    }

    const nextApplication = { ...application, [step.id]: final };
    const nextId = typeof step.next === 'function' ? step.next(nextApplication) : step.next;

    if (step.type !== 'review' && step.type !== 'completion') {
      setApplication(nextApplication);
    }

    goToStep(nextId);
  };

  const progressIndex = loanFlow.findIndex((item) => item.id === step.id) + 1;

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <ProgressIndicator current={progressIndex} total={loanFlow.length} />
      <div className="text-right mt-3">
        <a href="#" className="text-sm text-burgundy">Disclosures</a>
      </div>
      <StepCard title={step.title}>
        <p className="text-center text-xl mb-6">{step.question}</p>
        <div className="flex flex-col items-center gap-3">
          {step.type === 'singleChoice' &&
            step.options?.map((option) => (
              <ChoiceButton key={option} label={option} onClick={() => goNext(option)} />
            ))}

          {(step.type === 'text' || step.type === 'number' || step.type === 'date' || step.type === 'select') && (
            <>
              {step.type === 'select' ? (
                <select
                  className="w-full border rounded-xl p-3"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                >
                  {['', ...(step.options || [])].map((option) => (
                    <option key={option} value={option}>{option || 'Select an option'}</option>
                  ))}
                </select>
              ) : (
                <input
                  className="w-full border rounded-xl p-3"
                  type={step.type === 'date' ? 'date' : 'text'}
                  value={input}
                  onChange={(event) =>
                    setInput(
                      step.id === 'phone'
                        ? formatPhone(event.target.value)
                        : step.type === 'number'
                          ? formatCurrency(event.target.value)
                          : event.target.value
                    )
                  }
                  onKeyDown={(event) => event.key === 'Enter' && goNext()}
                />
              )}
              <button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={() => goNext()}>
                Continue
              </button>
            </>
          )}

          {step.type === 'contact' && (
            <>
              <input
                className="w-full border rounded-xl p-3"
                placeholder="First Name"
                value={application.firstName || ''}
                onChange={(event) => setApplication((previous) => ({ ...previous, firstName: event.target.value }))}
              />
              <input
                className="w-full border rounded-xl p-3"
                placeholder="Last Name"
                value={application.lastName || ''}
                onChange={(event) => setApplication((previous) => ({ ...previous, lastName: event.target.value }))}
              />
              <button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={() => goToStep(step.next as string)}>
                Continue
              </button>
            </>
          )}

          {step.type === 'review' && (
            <>
              <ReviewApplication application={application} onEdit={setCurrentId} />
              <button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={() => goNext()}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </>
          )}

          {step.type === 'completion' && (
            <div className="text-center">
              <p className="text-lg font-semibold">Application Submitted</p>
              <p className="text-gray-600 mt-2">We received your application. A loan specialist will contact you soon.</p>
            </div>
          )}

          {!!error && <p className="text-red-600 text-sm">{error}</p>}

          {stepHistory.length > 0 && step.type !== 'completion' ? (
            <button className="text-sm text-gray-500" onClick={goBack}>Back</button>
          ) : (
            <button className="text-sm text-gray-500" onClick={resetApplication}>Start Over</button>
          )}
        </div>
      </StepCard>
    </div>
  );
}
