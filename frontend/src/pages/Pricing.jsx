import { useState } from 'react';
import { Check } from 'lucide-react';

export default function Pricing() {
  const [currency, setCurrency] = useState('USD');

  const prices = {
    basic: { USD: 2.99, INR: '200' },
    enterprise: { USD: 199, INR: '1,000' }
  };

  const symbol = currency === 'USD' ? '$' : '₹';

  return (
    <div className="pricing-page container fade-in">
      <div className="page-header text-center">
        <h1>Transparent, Scalable Pricing</h1>
        <p>Choose the plan that fits your organization's needs.</p>
        
        {/* Currency Toggle */}
        <div className="d-flex justify-content-center mt-4">
          <div style={{ background: 'var(--bg-card)', padding: '4px', borderRadius: '30px', display: 'inline-flex', border: '1px solid var(--border-glass)' }}>
            <button 
              className={`btn ${currency === 'USD' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 24px', borderRadius: '24px', border: 'none' }}
              onClick={() => setCurrency('USD')}
            >
              USD ($)
            </button>
            <button 
              className={`btn ${currency === 'INR' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '8px 24px', borderRadius: '24px', border: 'none' }}
              onClick={() => setCurrency('INR')}
            >
              INR (₹)
            </button>
          </div>
        </div>
      </div>

      <div className="pricing-grid">
        {/* Basic Plan */}
        <div className="pricing-card">
          <div className="plan-name">Basic</div>
          <div className="plan-price">
            <span className="currency">{symbol}</span>
            <span className="amount">{prices.basic[currency]}</span>
            <span className="period">/mo</span>
          </div>
          <p className="plan-desc">For small teams and academic researchers.</p>
          <button className="btn btn-ghost w-100 mb-4">Start Free Trial</button>
          
          <ul className="plan-features">
            <li><Check size={18} /> 100 Document Uploads / mo</li>
            <li><Check size={18} /> Standard RAG Chat</li>
            <li><Check size={18} /> Basic Grammar Check</li>
            <li><Check size={18} /> Email Support</li>
          </ul>
        </div>

        {/* Enterprise Plan */}
        <div className="pricing-card premium">
          <div className="badge-popular">Most Popular</div>
          <div className="plan-name">Enterprise</div>
          <div className="plan-price">
            <span className="currency">{symbol}</span>
            <span className="amount">{prices.enterprise[currency]}</span>
            <span className="period">/mo</span>
          </div>
          <p className="plan-desc">For large organizations requiring advanced features.</p>
          <button className="btn btn-primary w-100 mb-4">Get Started</button>
          
          <ul className="plan-features">
            <li><Check size={18} /> Unlimited Document Uploads</li>
            <li><Check size={18} /> Advanced AI Models (GPT-4o, Claude)</li>
            <li><Check size={18} /> Deep Plagiarism Checking</li>
            <li><Check size={18} /> Team Workspaces & Roles</li>
            <li><Check size={18} /> Priority 24/7 Support</li>
          </ul>
        </div>

        {/* Custom Plan */}
        <div className="pricing-card">
          <div className="plan-name">Custom</div>
          <div className="plan-price">
            <span className="amount" style={{ fontSize: '2rem' }}>Let's Talk</span>
          </div>
          <p className="plan-desc">For organizations with bespoke security and volume needs.</p>
          <button className="btn btn-ghost w-100 mb-4">Contact Sales</button>
          
          <ul className="plan-features">
            <li><Check size={18} /> Dedicated Account Manager</li>
            <li><Check size={18} /> On-Premise Deployment Options</li>
            <li><Check size={18} /> Custom Integration API</li>
            <li><Check size={18} /> SLA Guarantees</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
