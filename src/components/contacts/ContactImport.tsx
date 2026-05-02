import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Camera, 
  FileText, 
  X, 
  Check, 
  AlertCircle, 
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { cn } from '@/lib/utils';
import { extractContactsFromImage, parseBulkTextContacts } from '@/lib/gemini';

interface ContactImportProps {
  onImport: (contacts: any[]) => void;
  onClose: () => void;
}

export function ContactImport({ onImport, onClose }: ContactImportProps) {
  const [step, setStep] = useState<'method' | 'uploading' | 'review'>('method');
  const [method, setMethod] = useState<'scan' | 'csv' | 'text' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedContacts, setExtractedContacts] = useState<any[]>([]);
  const [bulkText, setBulkText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setStep('uploading');

    try {
      if (method === 'scan') {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const base64 = reader.result as string;
            const contacts = await extractContactsFromImage(base64, file.type);
            setExtractedContacts(contacts);
            setStep('review');
          } catch (err) {
            console.error(err);
            setError("Failed to scan image. Please try again.");
            setStep('method');
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(file);
      } else if (method === 'csv') {
        Papa.parse(file, {
          header: true,
          complete: (results) => {
            const contacts = results.data.map((row: any) => ({
              firstName: row.firstName || row.first_name || row.Name?.split(' ')[0] || '',
              lastName: row.lastName || row.last_name || row.Name?.split(' ').slice(1).join(' ') || '',
              phone: row.phone || row.phoneNumber || row.mobile || '',
            })).filter(c => c.phone);
            setExtractedContacts(contacts);
            setStep('review');
            setIsProcessing(false);
          },
          error: (err) => {
            console.error(err);
            setError("Failed to parse CSV. Please check the file format.");
            setStep('method');
            setIsProcessing(false);
          }
        });
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
      setStep('method');
      setIsProcessing(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: method === 'scan' ? { 'image/*': [] } : { 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    multiple: false
  } as any);

  const handleBulkTextParse = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const contacts = await parseBulkTextContacts(bulkText);
      setExtractedContacts(contacts);
      setStep('review');
    } catch (err) {
      console.error(err);
      setError("Failed to parse text. Please check your input and try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const removeContact = (index: number) => {
    setExtractedContacts(extractedContacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const newContacts = [...extractedContacts];
    newContacts[index][field] = value;
    setExtractedContacts(newContacts);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Import Contacts</h2>
            <p className="text-xs text-gray-500">Add multiple contacts via AI scan, CSV, or bulk text.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto p-1.5 hover:bg-red-100 rounded-xl transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'method' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setMethod('scan')}
                className={cn(
                  "p-5 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all",
                  method === 'scan' ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", method === 'scan' ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-900">AI Scan</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Scan paper lists</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('csv')}
                className={cn(
                  "p-5 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all",
                  method === 'csv' ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", method === 'csv' ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                  <FileText className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-900">CSV / Excel</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Upload digital</p>
                </div>
              </button>

              <button 
                onClick={() => setMethod('text')}
                className={cn(
                  "p-5 border-2 rounded-2xl flex flex-col items-center gap-4 transition-all",
                  method === 'text' ? "border-blue-600 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-blue-200 hover:bg-gray-50"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center transition-colors", method === 'text' ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600")}>
                  <Edit2 className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm text-gray-900">Bulk Paste</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">Paste raw text</p>
                </div>
              </button>
            </div>
          )}

          {method && step === 'method' && method !== 'text' && (
            <div {...getRootProps()} className={cn(
              "mt-8 border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer",
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300 bg-gray-50/50"
            )}>
              <input {...getInputProps()} />
              <div className="w-16 h-16 bg-white text-gray-400 rounded-2xl flex items-center justify-center shadow-sm">
                <Upload className="w-8 h-8" />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-gray-900">
                  {isDragActive ? "Drop the file here" : "Click or drag file to upload"}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                  {method === 'scan' ? "Supports JPG, PNG, WEBP" : "Supports CSV, XLSX"}
                </p>
              </div>
            </div>
          )}

          {method === 'text' && step === 'method' && (
            <div className="mt-8 space-y-4">
              <textarea 
                className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm font-medium text-gray-900"
                placeholder="Paste your text here... e.g. John Doe 08012345678, Jane Smith +234..."
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
              />
              <button 
                onClick={handleBulkTextParse}
                disabled={!bulkText.trim() || isProcessing}
                className="w-full py-3.5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
              >
                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Parse Contacts"}
              </button>
            </div>
          )}

          {step === 'uploading' && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">Processing with AI...</p>
                <p className="text-sm text-gray-500 mt-1">We're extracting names and numbers from your file.</p>
              </div>
            </div>
          )}

          {step === 'review' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-3 text-blue-700">
                  <Check className="w-5 h-5" />
                  <span className="font-bold text-sm">Found {extractedContacts.length} contacts</span>
                </div>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Review before saving</p>
              </div>

              <div className="space-y-2">
                {extractedContacts.map((contact, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:border-blue-300 transition-all group shadow-sm">
                    <input 
                      type="text"
                      className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-900"
                      value={contact.firstName}
                      onChange={(e) => updateContact(index, 'firstName', e.target.value)}
                      placeholder="First Name"
                    />
                    <input 
                      type="text"
                      className="flex-1 min-w-0 bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-gray-900"
                      value={contact.lastName}
                      onChange={(e) => updateContact(index, 'lastName', e.target.value)}
                      placeholder="Last Name"
                    />
                    <input 
                      type="text"
                      className="flex-[1.5] min-w-0 bg-transparent border-none focus:ring-0 p-0 text-sm font-medium text-gray-500"
                      value={contact.phone}
                      onChange={(e) => updateContact(index, 'phone', e.target.value)}
                      placeholder="Phone Number"
                    />
                    <button 
                      onClick={() => removeContact(index)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/50">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 font-bold text-sm hover:bg-gray-200 rounded-xl transition-all border border-gray-200 bg-white"
          >
            Cancel
          </button>
          {step === 'review' && (
            <button 
              onClick={() => onImport(extractedContacts)}
              className="px-8 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
            >
              Save {extractedContacts.length} Contacts
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
