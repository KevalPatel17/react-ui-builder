import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Download } from 'lucide-react';
import { useBuilderStore } from '../../store/builderStore';
import { generateReactCode } from '../../utils/codeGenerator';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { elements } = useBuilderStore();
  const [activeTab, setActiveTab] = useState<'tailwind' | 'styled' | 'html-css'>('tailwind');
  const [copied, setCopied] = useState(false);
  const [code, setCode] = useState('');

  // Regenerate code whenever active format tab or elements list updates
  useEffect(() => {
    if (isOpen) {
      const generated = generateReactCode(elements, activeTab === 'styled' ? 'styled-components' : activeTab);
      setCode(generated);
    }
  }, [isOpen, activeTab, elements]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    const fileExtension = activeTab === 'html-css' ? 'html' : 'tsx';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExportedLayout.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { id: 'tailwind', label: 'React + Tailwind CSS' },
    { id: 'styled', label: 'React + Styled Components' },
    { id: 'html-css', label: 'HTML5 + Vanilla CSS' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-fade-in select-none">
      <div className="bg-[#12131a] border border-[#1f202c] shadow-2xl rounded-2xl w-full max-w-3xl flex flex-col overflow-hidden text-white animate-scale-up">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b0c11] border-b border-[#1f202c] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              Export Component Code
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-[#0b0c11]/40 border-b border-[#1f202c] px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Panel and Stats bar */}
        <div className="px-6 py-2 bg-[#0b0c11]/20 flex items-center justify-between border-b border-[#1f202c]/50 text-xs">
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
            {elements.length} Elements exported
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-950 hover:bg-gray-900 border border-gray-900 hover:border-gray-800 text-gray-300 hover:text-white rounded-lg transition-all cursor-pointer text-xs font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all cursor-pointer text-xs font-bold shadow-md shadow-indigo-600/10"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code display screen */}
        <div className="p-6 bg-[#0b0c11] flex-1 flex flex-col min-h-0 relative">
          <pre className="flex-1 bg-gray-950/70 p-4 border border-[#1f202c] rounded-xl overflow-auto text-[11px] font-mono text-indigo-300 leading-relaxed text-left max-h-[360px] no-scrollbar shadow-inner">
            <code>{code}</code>
          </pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-[#1f202c] bg-[#0b0c11] text-[10px] text-gray-500 leading-relaxed text-center">
          Code is generated using pure tailwind classes. Standard styles are wrapped inside custom brackets. To run this file, ensure you have{' '}
          <code className="text-gray-300">lucide-react</code> installed in your project path.
        </div>
      </div>
    </div>
  );
};
