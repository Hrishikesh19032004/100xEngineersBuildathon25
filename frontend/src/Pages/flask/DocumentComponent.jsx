import React, { useState, useEffect, useRef } from "react";
import { Send, FileText, Upload, Mic, Square, AlertCircle } from "lucide-react";

// Document Component
const DocumentComponent = ({ 
  inputText, 
  setInputText, 
  isProcessing, 
  setIsProcessing 
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [parsedText, setParsedText] = useState("");
  const [showParsedPreview, setShowParsedPreview] = useState(false);
  const [processingError, setProcessingError] = useState("");

  // Enhanced PDF text extraction using dynamic import
  const extractTextFromPDF = async (file) => {
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
            script.onload = async () => {
              try {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                const pdf = await window.pdfjsLib.getDocument({ 
                  data: new Uint8Array(e.target.result) 
                }).promise;
                
                let textContent = "";
                for (let i = 1; i <= pdf.numPages; i++) {
                  try {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items
                      .map((item) => item.str)
                      .join(" ")
                      .replace(/\s+/g, " ")
                      .trim();
                    
                    if (pageText) {
                      textContent += `Page ${i}:\n${pageText}\n\n`;
                    }
                  } catch (pageError) {
                    console.warn(`Error processing page ${i}:`, pageError);
                  }
                }
                
                resolve(textContent.trim() || "No readable text found in PDF.");
              } catch (pdfError) {
                reject(new Error(`PDF parsing failed: ${pdfError.message}`));
              }
            };
            script.onerror = () => reject(new Error("Failed to load PDF.js library"));
            document.head.appendChild(script);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read PDF file"));
        reader.readAsArrayBuffer(file);
      });
      
      return text;
    } catch (error) {
      throw new Error(`PDF parsing failed: ${error.message}`);
    }
  };

  // Enhanced Word document extraction using dynamic import
  const extractTextFromWord = async (file) => {
    try {
      const text = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.4.2/mammoth.browser.min.js';
            script.onload = async () => {
              try {
                const { value } = await window.mammoth.extractRawText({ 
                  arrayBuffer: e.target.result 
                });
                
                const cleanText = value
                  .replace(/\r?\n/g, '\n')
                  .replace(/\n\s*\n/g, '\n\n')
                  .trim();
                  
                resolve(cleanText || "No readable text found in Word document.");
              } catch (mammothError) {
                reject(new Error(`Word document parsing failed: ${mammothError.message}`));
              }
            };
            script.onerror = () => reject(new Error("Failed to load Mammoth library"));
            document.head.appendChild(script);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read Word document"));
        reader.readAsArrayBuffer(file);
      });
      
      return text;
    } catch (error) {
      throw new Error(`Word document parsing failed: ${error.message}`);
    }
  };

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsProcessing(true);
    setProcessingError("");
    
    // Add file to uploaded files list
    const fileInfo = { 
      id: Date.now() + Math.random(), 
      name: file.name,
      size: file.size,
      type: file.type
    };
    setUploadedFiles((prev) => [...prev, fileInfo]);

    // Reset previous parsed text
    setParsedText("");
    setShowParsedPreview(false);

    const fileExtension = file.name.split(".").pop().toLowerCase();

    try {
      let extractedText = "";
      
      if (fileExtension === "pdf") {
        extractedText = await extractTextFromPDF(file);
      } else if (fileExtension === "docx" || fileExtension === "doc") {
        extractedText = await extractTextFromWord(file);
      } else if (fileExtension === "txt") {
        extractedText = await file.text();
      } else {
        throw new Error("Unsupported file format. Please upload a PDF, Word document, or text file.");
      }

      if (extractedText.trim()) {
        setParsedText(extractedText);
        setShowParsedPreview(true);
      } else {
        setProcessingError("No text could be extracted from this file.");
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      setProcessingError(error.message || "Failed to parse the document.");
    } finally {
      setIsProcessing(false);
    }
  };

  const insertParsedText = () => {
    setInputText(prevText => {
      const separator = prevText.trim() ? '\n\n' : '';
      return prevText + separator + parsedText;
    });
    setShowParsedPreview(false);
    setParsedText("");
  };

  const discardParsedText = () => {
    setParsedText("");
    setShowParsedPreview(false);
    setProcessingError("");
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const resetDocumentState = () => {
    setParsedText("");
    setShowParsedPreview(false);
    setProcessingError("");
  };

  // Expose reset function
  useEffect(() => {
    window.resetDocumentState = resetDocumentState;
    return () => {
      delete window.resetDocumentState;
    };
  }, []);

  return {
    uploadedFiles,
    parsedText,
    showParsedPreview,
    processingError,
    handleFileUpload,
    insertParsedText,
    discardParsedText,
    removeFile,
    setProcessingError
  };
};

export default DocumentComponent;