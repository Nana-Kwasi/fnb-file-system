import React, { useState } from 'react';
import { Upload, Send } from 'lucide-react';

const UploadSignedButton = ({ fileId, onUpload }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSend = async () => {
    if (selectedFile) {
      await onUpload(fileId, selectedFile);
      setSelectedFile(null);
    }
  };

  return (
    <div className="upload-actions">
      <input
        type="file"
        id={`signed-po-${fileId}`}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx"
      />
      {selectedFile ? (
        <button
          onClick={handleSend}
          className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          <Send size={16} />
          <span>Send ({selectedFile.name})</span>
        </button>
      ) : (
        <button
          onClick={() => document.getElementById(`signed-po-${fileId}`).click()}
          className="flex items-center gap-2 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          <Upload size={16} />
          <span>Upload Signed</span>
        </button>
      )}
    </div>
  );
};

export default UploadSignedButton;