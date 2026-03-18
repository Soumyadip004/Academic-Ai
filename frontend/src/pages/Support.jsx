import { Mail, MessageCircle, Phone, FileText } from 'lucide-react';

export default function Support() {
  return (
    <div className="support-page container">
      <div className="page-header text-center fade-in-up">
        <h1>How can we help?</h1>
        <p>Choose an option below and our Enterprise Support team will assist you.</p>
      </div>

      <div className="support-grid">
        <div className="support-card">
          <div className="icon-wrap bg-primary"><MessageCircle size={32}/></div>
          <h3>Live Chat</h3>
          <p>Available 24/7 for Enterprise customers.</p>
          <button className="btn btn-primary w-100">Start a Conversation</button>
        </div>

        <div className="support-card">
          <div className="icon-wrap bg-success"><Mail size={32}/></div>
          <h3>Email Support</h3>
          <p>We typically reply within 2 hours.</p>
          <a href="mailto:support@academicai.com" className="btn btn-ghost w-100">Email Us</a>
        </div>

        <div className="support-card">
          <div className="icon-wrap bg-warning"><Phone size={32}/></div>
          <h3>Phone Support</h3>
          <p>Dedicated line for critical issues.</p>
          <a href="tel:+18005550199" className="btn btn-ghost w-100">Call Now</a>
        </div>

        <div className="support-card">
          <div className="icon-wrap bg-info"><FileText size={32}/></div>
          <h3>Documentation</h3>
          <p>Read our API references and guides.</p>
          <button className="btn btn-ghost w-100">Browse Docs</button>
        </div>
      </div>
      
      <div className="ticket-form card fade-in mt-4">
        <h3>Submit a Ticket</h3>
        <p className="text-muted mb-4">Please describe your issue in detail. If you are experiencing technical difficulties, include steps to reproduce.</p>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group mb-3">
            <label>Subject</label>
            <input type="text" placeholder="Brief description of your issue" />
          </div>
          <div className="form-group mb-3">
            <label>Description</label>
            <textarea rows="5" placeholder="Detailed explanation..."></textarea>
          </div>
          <button className="btn btn-primary">Submit Ticket</button>
        </form>
      </div>
    </div>
  );
}
