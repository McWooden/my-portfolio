import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';

const EMPTY_FORM = { name: '', role: '', avatar: '', website: '', social: '', socialType: 'linkedin' };

export default function NodeModal({ isOpen, onClose, onSubmit, title, submitLabel, initialData }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          name: initialData.name || '',
          role: initialData.role || '',
          avatar: initialData.avatar || '',
          website: initialData.website === '#' ? '' : initialData.website || '',
          social: initialData.social === '#' ? '' : initialData.social || '',
          socialType: initialData.socialType || 'linkedin'
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setError('');
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    onSubmit(form);
  };

  const handleChange = (field, val) => {
    setForm(prev => ({ ...prev, [field]: val }));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-md bg-[#171717] border border-border rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h2 className="text-white font-semibold text-[1.1rem] tracking-tight">{title}</h2>
            <p className="text-[0.78rem] text-yellow-400/80 font-mono uppercase tracking-wider mt-0.5">⚡ Dev mode only</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-white/5 hover:bg-white/10 border border-border rounded-full flex items-center justify-center text-white/60 hover:text-white cursor-pointer focus:outline-none transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Modal form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-3.5">
          {error && (
            <p className="text-red-400 text-[0.8rem] font-mono bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
          )}

          {[
            { label: 'Name *', field: 'name', placeholder: 'e.g. Jane Doe', type: 'text' },
            { label: 'Role', field: 'role', placeholder: 'e.g. UX Designer', type: 'text' },
            { label: 'Avatar URL', field: 'avatar', placeholder: 'Leave blank for auto-generated', type: 'text' },
            { label: 'Website', field: 'website', placeholder: 'https://example.com', type: 'text' },
            { label: 'Social URL', field: 'social', placeholder: 'https://linkedin.com/in/...', type: 'text' },
          ].map(({ label, field, placeholder, type }) => (
            <div key={field}>
              <label className="block text-[0.75rem] font-mono uppercase tracking-wider text-text-secondary mb-1.5">{label}</label>
              <input
                type={type}
                value={form[field]}
                onChange={e => handleChange(field, e.target.value)}
                placeholder={placeholder}
                className="w-full bg-[#1f1f1f] border border-border rounded-xl px-4 py-2.5 text-[0.9rem] text-white placeholder-text-secondary/40 focus:outline-none focus:border-accent/60 transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-[0.75rem] font-mono uppercase tracking-wider text-text-secondary mb-1.5">Social Type</label>
            <select
              value={form.socialType}
              onChange={e => handleChange('socialType', e.target.value)}
              className="w-full bg-[#1f1f1f] border border-border rounded-xl px-4 py-2.5 text-[0.9rem] text-white focus:outline-none focus:border-accent/60 transition-colors appearance-none cursor-pointer"
            >
              <option value="linkedin">LinkedIn</option>
              <option value="github">GitHub</option>
              <option value="twitter">Twitter / X</option>
            </select>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-border text-text-secondary hover:text-white py-2.5 rounded-xl text-[0.9rem] font-medium cursor-pointer focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-accent text-bg-dark font-semibold py-2.5 rounded-xl text-[0.9rem] hover:opacity-90 cursor-pointer focus:outline-none transition-opacity"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
