"use client";
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import Contact from '../components/Utils/Contact';
import BlogCard from '../components/Utils/BlogCard';
import { getImageUrl } from '../utils/image';
import { formatDate } from '../utils/date';
import { preventOrphans } from '../utils/text';

export default function BlogDetail({ post, prevPost, nextPost, otherPosts = [] }) {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post?.slug]);

  useEffect(() => {
    if (containerRef.current) {
      preventOrphans(containerRef.current);
    }
  }, [post?.content]);

  if (!post) {
    return null;
  }

  return (
    <div ref={containerRef} className="pt-20 bg-bg-dark">

      {/* Article header */}
      <section className="pt-[100px] pb-[60px] px-10 max-[810px]:pt-[60px] max-[810px]:px-5 max-w-[900px] mx-auto flex flex-col items-center text-center border-b border-border">
        <div className="flex items-center gap-4 font-mono text-[0.95rem] mb-5">
          <span className="text-accent uppercase">{post.category}</span>
          <span className="text-text-muted">•</span>
          <span className="text-text-muted">{formatDate(post.date)}</span>
        </div>
        <h1 className="text-[2.8rem] md:text-[3.6rem] font-medium text-white tracking-[-0.03em] leading-[1.15] mb-4">
          {post.title}
        </h1>
        <p className="text-[1.25rem] text-text-secondary leading-[1.4]">{post.subtitle}</p>
      </section>

      {/* Hero image */}
      {getImageUrl(post.coverImage) && (
        <div className="max-w-[900px] mx-auto my-10 px-10 max-[810px]:px-5">
          <img
            src={getImageUrl(post.coverImage)}
            alt={post.title}
            className="w-full rounded-[30px] border border-border"
          />
        </div>
      )}

      {/* Article body */}
      <article className="max-w-[800px] mx-auto px-10 max-[810px]:px-5 pb-[80px] flex flex-col gap-6 text-[1.15rem] leading-[1.6] text-text-secondary text-left">
        {post.content && (
          <div 
            className="blog-document-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}
      </article>

      {/* Prev / Next navigator */}
      <div className="max-w-[900px] mx-auto px-10 max-[810px]:px-5 py-10 border-t border-b border-border flex justify-between items-center">
        {prevPost ? (
          <Link href={`/blog/${prevPost.slug}`} className="flex flex-col gap-[6px] max-w-[45%] items-start text-left group">
            <span className="font-mono text-[0.85rem] text-text-muted uppercase">‹ Previous Post</span>
            <span className="text-[1rem] font-medium text-white transition-colors duration-200 group-hover:text-accent">{prevPost.title}</span>
          </Link>
        ) : <div />}

        {nextPost ? (
          <Link href={`/blog/${nextPost.slug}`} className="flex flex-col gap-[6px] max-w-[45%] items-end text-right group">
            <span className="font-mono text-[0.85rem] text-text-muted uppercase">Next Post ›</span>
            <span className="text-[1rem] font-medium text-white transition-colors duration-200 group-hover:text-accent">{nextPost.title}</span>
          </Link>
        ) : <div />}
      </div>

      {/* More articles */}
      <section className="py-[100px] px-10 max-[810px]:py-[60px] max-[810px]:px-5 flex flex-col items-center border-b border-border">
        <div className="text-center max-w-[800px] mb-[60px] flex flex-col items-center">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[0.9rem] text-accent opacity-80">01</span>
            <span className="font-mono text-[0.9rem] text-text-secondary opacity-50 uppercase">Latest articles</span>
            <span className="font-mono text-[0.9rem] text-text-secondary opacity-50 uppercase">Blog</span>
          </div>
          <h2 className="text-[2.2rem] md:text-[3rem] font-medium tracking-[-0.04em] leading-[1.1] text-white mb-3">More Articles</h2>
          <p className="text-[1.15rem] text-text-secondary mb-10">Notes from behind the screen</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[30px] w-full max-w-[1600px]">
          {otherPosts.map((otherPost) => (
            <BlogCard key={otherPost.slug} post={otherPost} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <Contact />
    </div>
  );
}
