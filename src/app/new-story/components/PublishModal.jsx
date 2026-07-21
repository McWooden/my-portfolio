'use client';

import React from 'react';

export default function PublishModal({
  showPublishModal,
  setShowPublishModal,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  coverImage,
  errorMsg,
  publishSuccess,
  storyType,
  setStoryType,
  featured,
  setFeatured,
  categories,
  categoryInput,
  setCategoryInput,
  addCategoryTag,
  removeCategoryTag,
  locationIndustryInput,
  handleLocationIndustryChange,
  testimonialQuote,
  setTestimonialQuote,
  testimonialAuthor,
  setTestimonialAuthor,
  testimonialCompany,
  setTestimonialCompany,
  handlePublish,
  authLoading,
  titleTextareaRef,
  subtitleTextareaRef,
  isAdmin = false
}) {
  React.useEffect(() => {
    if (showPublishModal) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');
      
      return () => {
        if (originalBodyOverflow) {
          document.body.style.setProperty('overflow', originalBodyOverflow);
        } else {
          document.body.style.removeProperty('overflow');
        }
        if (originalHtmlOverflow) {
          document.documentElement.style.setProperty('overflow', originalHtmlOverflow);
        } else {
          document.documentElement.style.removeProperty('overflow');
        }
      };
    }
  }, [showPublishModal]);

  if (!showPublishModal) return null;

  return (
    <div className="fixed inset-0 bg-[#08080a] z-50 overflow-y-auto p-6 md:p-12 animate-fade-in">
      {/* Close button in top-right */}
      <button 
        onClick={() => setShowPublishModal(false)}
        className="absolute top-6 right-6 md:top-10 md:right-10 text-neutral-500 hover:text-white text-3xl font-light cursor-pointer transition-colors duration-200"
        aria-label="Close modal"
      >
        ✕
      </button>

      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 py-10 relative z-10">
        
        {/* Left column: Story Preview */}
        <div className="flex flex-col gap-6 text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">Story preview</h2>
          
          {/* Cover Image Preview */}
          {coverImage ? (
            <div className="w-full aspect-[1.8] rounded-xl overflow-hidden border border-neutral-800 shadow-md">
              <img 
                src={coverImage} 
                alt="Story Cover Preview" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[1.8] bg-neutral-900 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center p-8 text-neutral-500 gap-2">
              <span className="text-2xl">🖼️</span>
              <span className="text-xs leading-relaxed max-w-[240px]">
                Include a high-quality image in your story to make it more inviting to readers.
              </span>
            </div>
          )}

          {/* Editable Title */}
          <div className="flex flex-col gap-1.5 mt-2">
            <textarea
              ref={titleTextareaRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-b border-neutral-800 focus:border-accent text-lg font-bold text-white py-2 focus:outline-none transition-colors duration-200 resize-none overflow-hidden"
              placeholder="Preview Title"
              maxLength={100}
              rows={1}
            />
            <span className="text-[10px] font-mono text-neutral-600 self-end">
              {title.length}/100
            </span>
          </div>

          {/* Editable Subtitle */}
          <div className="flex flex-col gap-1.5">
            <textarea
              ref={subtitleTextareaRef}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              rows={1}
              className="w-full bg-transparent border-b border-neutral-800 focus:border-accent text-sm text-neutral-400 py-2 focus:outline-none transition-colors duration-200 resize-none leading-relaxed overflow-hidden"
              placeholder="Preview Subtitle"
              maxLength={140}
            />
            <span className="text-[10px] font-mono text-neutral-600 self-end">
              {subtitle.length}/140
            </span>
          </div>

          <p className="text-xs text-neutral-500 leading-relaxed mt-4">
            <span className="font-semibold text-neutral-400">Note:</span> Changes here will affect how your story appears in public places like homepage and in inboxes — not the contents of the story itself.
          </p>
        </div>

        {/* Right column: Metadata & Details */}
        <div className="flex flex-col gap-8 text-left justify-between">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-2">Publish Settings</h3>
              <p className="text-xs text-neutral-500">Configure parameters used for sitemaps, grid cards, and layout filtering.</p>
            </div>

            {/* Status Alerts inside Modal */}
            {errorMsg && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono text-center">
                {errorMsg}
              </div>
            )}
            {publishSuccess && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-accent text-xs font-mono text-center">
                Published successfully! Redirecting...
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="text-sm text-neutral-400">
                Story type:{' '}
                <button
                  type="button"
                  onClick={() => setStoryType(storyType === 'blog' ? 'project' : 'blog')}
                  className="text-accent underline decoration-dashed underline-offset-4 cursor-pointer font-semibold transition-colors duration-150 hover:text-white"
                >
                  {storyType === 'blog' ? 'Blog' : 'Portfolio'}
                </button>
              </div>



              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1.5">Category</label>
                <div className="w-full flex flex-wrap gap-2 p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl focus-within:border-accent/40 min-h-[46px] items-center">
                  {categories.map((cat, idx) => (
                    <span key={idx} className="flex items-center gap-1.5 px-3 py-1 bg-neutral-800 border border-neutral-700/60 text-white rounded-full text-xs font-mono select-none">
                      {cat}
                      <button
                        type="button"
                        onClick={() => removeCategoryTag(idx)}
                        className="text-neutral-500 hover:text-red-400 font-bold transition-colors duration-150 focus:outline-none"
                        title="Remove tag"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        if (categoryInput.trim() !== '') {
                          addCategoryTag(categoryInput);
                          setCategoryInput('');
                        }
                      }
                    }}
                    placeholder={categories.length === 0 ? "Type category & press Enter..." : ""}
                    className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-white placeholder-neutral-700 p-0 focus:ring-0"
                  />
                </div>
              </div>

              {storyType === 'project' && (
                <>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-1.5">Location & Industry</label>
                    <input
                      type="text"
                      value={locationIndustryInput}
                      onChange={(e) => handleLocationIndustryChange(e.target.value)}
                      placeholder="e.g. London, UK — SaaS"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-sm text-white placeholder-neutral-700 focus:outline-none focus:border-accent/40"
                    />
                  </div>

                  <div>
                    <h4 className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">Client Testimonial</h4>
                    <div className="flex flex-col gap-3 p-4 bg-neutral-900/40 rounded-2xl border border-neutral-900">
                      <div>
                        <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-600 mb-1">Quote</label>
                        <textarea
                          value={testimonialQuote}
                          onChange={(e) => setTestimonialQuote(e.target.value)}
                          placeholder="Client testimonial quote..."
                          rows={2}
                          className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-accent/40 resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-600 mb-1">Author</label>
                          <input
                            type="text"
                            value={testimonialAuthor}
                            onChange={(e) => setTestimonialAuthor(e.target.value)}
                            placeholder="Jane Doe"
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-accent/40"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-mono uppercase tracking-wide text-neutral-600 mb-1">Company</label>
                          <input
                            type="text"
                            value={testimonialCompany}
                            onChange={(e) => setTestimonialCompany(e.target.value)}
                            placeholder="Alder & Co"
                            className="w-full px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-white placeholder-neutral-700 focus:outline-none focus:border-accent/40"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Publish CTA */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handlePublish}
              disabled={authLoading}
              className="px-8 py-3.5 bg-accent hover:bg-white text-bg-dark font-semibold rounded-full text-sm transition-all duration-200 disabled:bg-neutral-800 disabled:text-neutral-500 cursor-pointer active:scale-95 shadow-lg shadow-accent/10"
            >
              {authLoading ? 'Publishing...' : 'Publish Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
