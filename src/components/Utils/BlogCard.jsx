import React from 'react';
import Link from 'next/link';
import { getImageUrl } from '../../utils/image';
import { formatDate } from '../../utils/date';

export const BlogCard = ({ post, className = '', style = {} }) => (
  <Link
    href={`/blog/${post.slug}`}
    className={`relative block w-full aspect-[1.6] rounded-[30px] overflow-hidden group text-left ${className}`}
    style={style}
  >
    {/* Background Image */}
    {getImageUrl(post.coverImage) && (
      <img
        src={getImageUrl(post.coverImage)}
        alt={post.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
      />
    )}

    {/* Dark Gradient Overlay for readability */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/50" />

    {/* Foreground Content overlaying the image */}
    <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between z-10">
      {/* Top row: Category tag & Date */}
      <div className="flex justify-between items-center w-full">
        <span className="font-mono text-[12px] md:text-[13px] tracking-[0.05em] uppercase text-white border border-white/40 px-[14px] py-[6px] rounded-full">
          {post.category}
        </span>
        <span className="font-mono text-[12px] md:text-[13px] text-white/80 uppercase">
          {formatDate(post.date)}
        </span>
      </div>

      {/* Bottom row: Title */}
      <h4 className="text-[20px] md:text-[24px] font-semibold text-white leading-tight tracking-[-0.02em]">
        {post.title}
      </h4>
    </div>
  </Link>
);

export default BlogCard;
