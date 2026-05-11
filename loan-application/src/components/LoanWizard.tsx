import { useEffect, useMemo, useState } from 'react';
import { loanFlow } from '../data/loanFlow';
import { LoanApplication } from '../types/application';
import ChoiceButton from './ChoiceButton';
import ProgressIndicator from './ProgressIndicator';
import StepCard from './StepCard';
import ReviewApplication from './ReviewApplication';

const formatCurrency = (v: string) => v.replace(/[^\d]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const formatPhone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

export default function LoanWizard() {
  const [application, setApplication] = useState<LoanApplication>(() => JSON.parse(localStorage.getItem('loanApp') || '{}'));
  const [currentId, setCurrentId] = useState(localStorage.getItem('loanStep') || loanFlow[0].id);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const step = useMemo(() => loanFlow.find((s) => s.id === currentId)!, [currentId]);

  useEffect(() => { localStorage.setItem('loanApp', JSON.stringify(application)); localStorage.setItem('loanStep', currentId); }, [application, currentId]);
  useEffect(() => setInput(application[step.id] || ''), [step.id, application]);

  const goNext = async (value?: string) => {
    const final = value ?? input;
    if (step.type !== 'review' && step.type !== 'completion' && !final) return setError('This field is required.');
    if (step.validate) { const msg = step.validate(final, application); if (msg) return setError(msg); }
    setError('');
    if (step.id === 'review') {
      setLoading(true); await new Promise((r) => setTimeout(r, 900)); console.log('submitApplication payload', application); setLoading(false); return setCurrentId('completion');
    }
    const nextId = typeof step.next === 'function' ? step.next({ ...application, [step.id]: final }) : step.next;
    if (step.type !== 'review' && step.type !== 'completion') setApplication((prev) => ({ ...prev, [step.id]: final }));
    if (nextId) setCurrentId(nextId);
  };

  return <div className="max-w-3xl mx-auto p-4 md:p-8"><ProgressIndicator current={loanFlow.findIndex((s) => s.id === currentId) + 1} total={loanFlow.length} /><div className="text-right mt-3"><a href="#" className="text-sm text-burgundy">Disclosures</a></div><StepCard title={step.title}><p className="text-center text-xl mb-6">{step.question}</p>
    <div className="flex flex-col items-center gap-3">
      {step.type === 'singleChoice' && step.options?.map((o) => <ChoiceButton key={o} label={o} onClick={() => goNext(o)} />)}
      {(step.type === 'text' || step.type === 'number' || step.type === 'date' || step.type === 'select') && (
        <>
          {step.type === 'select' ? <select className="w-full border rounded-xl p-3" value={input} onChange={(e)=>setInput(e.target.value)}>{['', ...(step.options || [])].map((o)=><option key={o} value={o}>{o || 'Select an option'}</option>)}</select> : <input className="w-full border rounded-xl p-3" type={step.type === 'date' ? 'date' : 'text'} value={input} onChange={(e)=> setInput(step.id==='phone'?formatPhone(e.target.value): step.type==='number'?formatCurrency(e.target.value): e.target.value)} onKeyDown={(e)=> e.key==='Enter' && goNext()} />}
          <button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={()=>goNext()}>Continue →</button>
        </>
      )}
      {step.type === 'contact' && <><input className="w-full border rounded-xl p-3" placeholder="First Name" value={application.firstName || ''} onChange={(e)=>setApplication((p)=>({...p, firstName:e.target.value}))}/><input className="w-full border rounded-xl p-3" placeholder="Last Name" value={application.lastName || ''} onChange={(e)=>setApplication((p)=>({...p, lastName:e.target.value}))}/><button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={()=>setCurrentId(step.next as string)}>Continue →</button></>}
      {step.type === 'review' && <><ReviewApplication application={application} onEdit={setCurrentId} /><button className="rounded-full bg-burgundy text-white px-8 py-3" onClick={()=>goNext()}>{loading ? 'Submitting...' : 'Submit Application'}</button></>}
      {step.type === 'completion' && <div className="text-center"><p className="text-lg font-semibold">Application Submitted</p><p className="text-gray-600 mt-2">We received your application. A loan specialist will contact you soon.</p></div>}
      {!!error && <p className="text-red-600 text-sm">{error}</p>}
      <button className="text-sm text-gray-500" onClick={()=>{setApplication({}); setCurrentId(loanFlow[0].id);}}>Start Over</button>
    </div>
  </StepCard></div>;
}
