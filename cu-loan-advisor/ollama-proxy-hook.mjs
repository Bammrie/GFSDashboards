import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434').replace(/\/+$/, '');
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'cu-loan-advisor:latest';
const OLLAMA_TIMEOUT_MS = process.env.OLLAMA_TIMEOUT_MS ? Number(process.env.OLLAMA_TIMEOUT_MS) : 30_000;
const ADVISOR_UNAVAILABLE_MESSAGE = 'The AI advisor is temporarily unavailable. Please try again.';

const APPLICATION_CONTEXT = `You are CU Loan Advisor, a consumer-facing assistant helping complete a Consumer Loan Application.

The loan application form is already loaded as the destination. Do not ask the borrower to upload loan application questions before starting.

Use this Consumer Loan Application checklist as the form you are trying to complete:

Application Metadata:
- Applicant account number, if already known or provided by the credit union
- Application date

Consumer Loan Type:
- Coverage package, if selected
- Purpose of loan
- Requested loan amount
- Type of application, such as used car purchase, refinance, debt consolidation, personal loan, or other purpose

Applicant Personal And Residence Details:
- Full legal name
- Home phone number
- Email address
- Marital status
- Primary residence status, such as own or rent
- Monthly housing payment
- Date of birth
- Driver's license number
- Social Security number
- Current street address
- Years at current address
- Number of dependents
- Country
- City
- State
- ZIP code

Family Reference Details:
- Nearest relative or reference name
- Relationship to relative/reference
- Relative/reference contact phone
- Relative/reference street address
- Country
- City
- State
- ZIP code

Current Employment Details:
- Employer name
- Years at employer
- Current gross monthly income before taxes
- Whether an employment/income document is attached

Applicant Other Income:
- Whether applicant has other income
- If yes, source, amount, and whether the borrower wants it considered

Applicant Declarations:
- Whether applicant is a co-maker or endorser on any note
- Whether applicant is a member at any other credit union
- Whether applicant has outstanding judgments
- Whether applicant has bankruptcy or Chapter 13 filings
- Whether applicant has foreclosure or lost title/deed in the past 7 years
- Whether applicant is party to any lawsuit
- Whether applicant is a U.S. citizen or permanent resident
- Whether any listed income is likely to be reduced within the next two years

Loan Protection Questions:
- Whether borrower wants remaining balance cancellation/payoff if they pass away or become critically ill
- Whether borrower wants payment protection if hurt and unable to work
- Treat these as optional protection questions. Do not present them as required products.

Cosigner / Joint Owner:
- Whether borrower wants to add a joint owner or co-signer

If a cosigner is included, collect these sections:
- Joint Owner / Co-Signer Personal Details
- Joint Owner / Co-Signer Employment Details
- Joint Owner / Co-Signer Other Income
- Joint Owner / Co-Signer Declarations
- Cosigner signature confirmation

Applicant Signature And Authorization:
- Applicant email
- Applicant confirmation that information is correct and complete
- Applicant authorization to check and discuss credit history
- Applicant signature confirmation
- Signature date

Behavior:
- Ask one main question at a time unless two short related questions are natural.
- Start with loan amount, loan purpose, and loan type before sensitive fields.
- If the borrower gives a clear purpose that identifies the loan type, such as debt consolidation, vehicle purchase, refinance, home improvement, or personal expense, record that as both the purpose and likely loan type. Do not ask the borrower to choose the application type again.
- For debt consolidation, after amount and purpose are known, ask what debts are being consolidated or about current monthly debt payments.
- Ask sensitive fields such as SSN, DOB, driver's license, and full address only when the borrower is clearly ready to complete the official application and the interface is appropriate for collecting it.
- If the borrower has not decided on a cosigner, ask whether one will be added before collecting cosigner details.
- When summarizing progress, use a clear checklist of Completed, Missing, and Can wait until official form/signature.
- Never copy personal answers from any sample or completed PDF into a new application.
- Never claim the application is submitted. Your goal is to collect and organize the information for completion or review.`;

function ollamaApiUrl(endpoint) {
  return `${OLLAMA_BASE_URL}/api/${String(endpoint).replace(/^\/+/, '')}`;
}

async function fetchOllamaJson(endpoint, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(ollamaApiUrl(endpoint), {
      ...options,
      signal: controller.signal
    });
    const text = await response.text();
    let payload = {};

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = { error: text };
      }
    }

    if (!response.ok) {
      throw new Error(payload.error || `Ollama returned HTTP ${response.status}.`);
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeAdvisorMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .slice(-30)
    .map((message) => {
      const role = message?.role === 'assistant' ? 'assistant' : 'user';
      const content = typeof message?.content === 'string' ? message.content.trim().slice(0, 12_000) : '';
      return { role, content };
    })
    .filter((message) => message.content);
}

function registerCuLoanAdvisorRoutes(app, express) {
  app.locals.cuLoanAdvisorRoutesRegistered = true;

  app.get(['/cu-loan-advisor/', '/cu-loan-advisor/index.html'], (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  app.get('/api/ollama/health', async (_req, res) => {
    try {
      const payload = await fetchOllamaJson('tags');
      const models = Array.isArray(payload.models) ? payload.models : [];
      const modelAvailable = models.some((model) => model?.name === OLLAMA_MODEL || model?.model === OLLAMA_MODEL);

      res.json({
        ok: true,
        model: OLLAMA_MODEL,
        modelAvailable
      });
    } catch (error) {
      console.warn('CU Loan Advisor Ollama health check failed.', error);
      res.status(503).json({
        ok: false,
        model: OLLAMA_MODEL,
        modelAvailable: false,
        error: ADVISOR_UNAVAILABLE_MESSAGE
      });
    }
  });

  app.post('/api/advisor/chat', express.json({ limit: '1mb' }), async (req, res) => {
    const advisorMessages = normalizeAdvisorMessages(req.body?.messages);

    if (!advisorMessages.length || advisorMessages[advisorMessages.length - 1].role !== 'user') {
      res.status(400).json({ error: 'A borrower message is required.' });
      return;
    }

    try {
      const payload = await fetchOllamaJson('chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            {
              role: 'system',
              content: APPLICATION_CONTEXT
            },
            ...advisorMessages
          ],
          stream: false
        })
      });

      const assistantContent = payload.message?.content;

      if (!assistantContent) {
        throw new Error('Ollama returned an empty response.');
      }

      res.json({
        model: payload.model || OLLAMA_MODEL,
        message: {
          role: 'assistant',
          content: assistantContent
        },
        done: Boolean(payload.done)
      });
    } catch (error) {
      console.warn('CU Loan Advisor chat failed.', error);
      res.status(503).json({ error: ADVISOR_UNAVAILABLE_MESSAGE });
    }
  });
}

export function installCuLoanAdvisorProxy(express) {
  const appPrototype = express?.application;

  if (!appPrototype || appPrototype.cuLoanAdvisorProxyInstalled) {
    return;
  }

  const originalUse = appPrototype.use;

  appPrototype.use = function cuLoanAdvisorProxyUsePatch(...args) {
    if (!this.locals?.cuLoanAdvisorRoutesRegistered) {
      registerCuLoanAdvisorRoutes(this, express);
    }

    return originalUse.apply(this, args);
  };

  appPrototype.cuLoanAdvisorProxyInstalled = true;
}
