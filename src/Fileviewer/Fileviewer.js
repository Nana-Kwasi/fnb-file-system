import React from 'react';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import '../fileview.css'

const FileViewer = ({ file, onBack, onDownload, formatAmount, getStageNumber }) => {
  if (!file) {
    return (
      <div className="file-viewer-container">
        <div className="file-viewer-header">
          
        </div>
        
      </div>
    );
  }

  return (
    <div className="file-viewer-container">
      <div className="file-viewer-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>
        <div className="file-viewer-title">
          <h2>Invoice Viewer</h2>
          <span className="file-name">{file.name}</span>
        </div>
        <button className="download-button" onClick={onDownload}>
          <Download size={20} />
          <span>Download</span>
        </button>
      </div>

      <div className="file-viewer-content">
        <div className="file-info-panel">
          <div className="file-info-card">
            <h3>Amount</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="amount-value">{formatAmount(file.amount)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="file-preview-panel">
          <div className="preview-card">
            <h3>Document Preview</h3>
            <div className="preview-content">
              {file.content ? (
                <>
                  {file.type.includes('pdf') ? (
                    <div className="pdf-preview">
                      <iframe 
                        src={file.content} 
                        className="pdf-frame"
                        title="Invoice Preview"
                        width="100%"
                        height="600px"
                      />
                    </div>
                  ) : file.type.includes('image') ? (
                    <div className="image-preview">
                      <img 
                        src={file.content} 
                        alt="Invoice Preview" 
                        className="preview-image"
                      />
                    </div>
                  ) : (
                    <div className="preview-not-available">
                      <div className="preview-icon">
                        <FileText size={64} />
                      </div>
                      <h4>Preview Not Available</h4>
                      <p>This file type cannot be previewed in the browser.</p>
                      <p>Click the download button to view the file.</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="preview-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading file preview...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileViewer;