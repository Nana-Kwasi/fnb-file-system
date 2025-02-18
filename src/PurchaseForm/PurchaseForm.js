import React from 'react';
import "../Request.css"

const PurchaseForm = () => {
  const today = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="purchase-form-container">
      <div className="watermark">
        First National Bank
        Requisition Form
      </div>
      
      <div className="form-header">
        <div className="header-left">
          <p className="acrobat-text">Please complete this form with Fnb file system.</p>
        </div>
        <img src="/FNB LOGO.png" alt="First National Bank Logo" className="fnb-logo" />
      </div>

      <div className="form-title-section">
        <h1>PURCHASE REQUISITION FORM</h1>
        <div className="date-box">{today}</div>
      </div>

      <div className="form-section">
        <div className="section-header">PURCHASE ORDER DETAILS</div>
        <div className="form-content">
          <div className="form-row">
            <label>HAS THE EXPENSE BEEN BUDGETED FOR?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="budgeted" />
                <span>YES</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="budgeted" />
                <span>NO</span>
              </label>
            </div>
          </div>

          <div className="form-row">
            <label>DO YOU HAVE MORE THAN ONE QUOTATION:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="quotation" />
                <span>YES</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="quotation" />
                <span>NO</span>
              </label>
            </div>
          </div>

          <div className="form-row">
            <label>WHAT IS THE TOTAL AMOUNT ON THE QUOTATION:</label>
            <input type="text" className="amount-input" defaultValue="GHS 63,704.12" />
          </div>
        </div>
      </div>

      <div className="form-section incomplete-section">
        <div className="section-header highlight">INCOMPLETE PURCHASE ORDER DETAIL</div>
        <div className="form-content empty-content"></div>
      </div>

      <div className="form-section">
        <div className="form-content">
          <div className="form-row">
            <label>HAVE YOUR QUOTATION BEEN APPROVED:</label>
            <div className="radio-group">
              <label className="radio-label">
                <input type="radio" name="approved" />
                <span>YES</span>
              </label>
              <label className="radio-label">
                <input type="radio" name="approved" />
                <span>NO</span>
              </label>
            </div>
          </div>
          <p className="answer-last">(PLEASE ANSWER THIS QUESTION LAST)</p>
        </div>
      </div>

      <div className="form-footer">
        <div className="signature-line">
          <div className="signature-block">
            <span>I,</span>
            <span className="name">Kwesi Ofori Eshun</span>
          </div>
          <div className="certification-text">
            CERTIFY THAT THE ABOVE INFORMATION IS ACCURATE TO THE BEST OF MY KNOWLEDGE.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseForm;