import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "What is Academic AI Enterprise?",
    answer: "Academic AI Enterprise is a comprehensive suite of AI tools designed for large research teams and academic institutions. It provides secure document storage, advanced RAG conversational capabilities, grammar checking, and plagiarism detection."
  },
  {
    question: "How secure is my data?",
    answer: "Security is our top priority. All documents uploaded to the platform are encrypted both in transit and at rest. We adhere to SOC2 compliance and do not use your proprietary data to train our foundational models."
  },
  {
    question: "Can I manage multiple teams under one organization?",
    answer: "Yes, our platform supports advanced Role-Based Access Control (RBAC). Admin users can create workspaces, manage team members, and set document access permissions easily from the Dashboard Settings."
  },
  {
    question: "What AI models do you use?",
    answer: "We leverage a hybrid approach, using powerful local vector databases like FAISS and SentenceTransformers for fast, secure retrieval, and state-of-the-art LLMs (like GPT-4 and Llama 3) for high-quality generation, depending on your deployment choice."
  },
  {
    question: "Do you offer on-premise deployments?",
    answer: "Yes, for Enterprise and Custom plan customers, we offer guided on-premise or private-cloud deployments to ensure maximum data privacy."
  }
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="faq-page container">
      <div className="page-header text-center fade-in-up">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about the product and billing.</p>
      </div>

      <div className="faq-container">
        {FAQS.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
          >
            <div className="faq-question">
              <h4>{faq.question}</h4>
              {openIndex === index ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                <p>{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
