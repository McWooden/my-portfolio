nice, but the testimonial is floating in the inside container of its cover, overall like this, but we must upload the avatar of this person who testimonial whichis we must add input image on the keystatic/collection/projects/item

example testimonial card

<div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{
          transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
        className="absolute top-[30px] left-5 bg-white text-bg-dark p-5 rounded-3xl w-[280px] flex flex-col gap-4 z-30 select-none"
      >
        <p className="font-sans text-[0.95rem] leading-[1.4] text-[#1a1a1a] font-medium">
          "{quote}"
        </p>
        <div className="flex items-center gap-[10px]">
          <img
            src={avatarUrl}
            alt={author}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-[0.9rem] text-text-muted font-medium">{author}, {company}</span>
        </div>
        <Link 
          href={`/portfolio/${slug}`}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          className="absolute right-5 bottom-5 text-bg-dark hover:scale-110 transition-transform duration-200 cursor-pointer"
        >
          <svg viewBox="0 0 36 36" className="w-6 h-6">
            <path d="M10 26 L24 12 M24 12 L14 12 M24 12 L24 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </Link>
      </div>
