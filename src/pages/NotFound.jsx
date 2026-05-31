import React from 'react';
import { Link } from 'react-router-dom';
import { blogPosts } from '../data/siteData';
import Contact from '../components/Utils/Contact';
import BlogCard from '../components/Utils/BlogCard';

export default function NotFound() {
  return (
    <div className="pt-20 bg-bg-dark">

      {/* 404 Header */}
      <section className="pt-[120px] pb-[80px] px-10 max-[810px]:px-5 flex flex-col items-center text-center border-b border-border gap-5">
        <h1 className="font-mono text-[5rem] md:text-[8rem] font-medium text-accent tracking-[-0.05em] leading-none">
          404
        </h1>
        <h2 className="text-[2.2rem] font-medium text-white tracking-[-0.04em] mb-2">
          Are you lost?
        </h2>
        <p className="text-[1.15rem] text-text-secondary leading-[1.5] mb-[30px] max-w-[480px]">
          Of all the pages you could've visited, you landed on this one?
        </p>
        <Link
          to="/"
          className="bg-accent text-bg-dark font-sans text-[1.05rem] font-semibold px-7 py-[14px] rounded-full transition-all duration-200 hover:bg-white hover:-translate-y-0.5"
        >
          Get back to home
        </Link>
      </section>

      {/* Blog suggestions */}
      <section className="py-[100px] px-10 max-[810px]:py-[60px] max-[810px]:px-5 flex flex-col items-center border-b border-border">
        <div className="text-center max-w-[800px] mb-[60px] flex flex-col items-center">
          <div className="flex items-center gap-3 mb-5">
            <span className="font-mono text-[0.9rem] text-accent opacity-80">01</span>
            <span className="font-mono text-[0.9rem] text-text-secondary opacity-50 uppercase">Latest articles</span>
            <span className="font-mono text-[0.9rem] text-text-secondary opacity-50 uppercase">Blog</span>
          </div>
          <h2 className="text-[2.2rem] md:text-[3rem] font-medium tracking-[-0.04em] leading-[1.1] text-white mb-3">
            Start fresh with something worth reading
          </h2>
          <p className="text-[1.15rem] text-text-secondary mb-10">Notes from behind the screen</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[30px] w-full max-w-[1600px]">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <Contact />
    </div>
  );
}
