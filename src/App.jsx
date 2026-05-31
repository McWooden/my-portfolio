import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Utils/Header';
import Footer from './components/Utils/Footer';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Blog from './pages/Blog';
import Network from './pages/Network';
import ProjectDetail from './pages/ProjectDetail';
import BlogDetail from './pages/BlogDetail';
import NotFound from './pages/NotFound';

import ScrollToTop from './components/Utils/ScrollToTop';

function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/network" element={<Network />} />
          <Route path="/portfolio/:slug" element={<ProjectDetail />} />
          <Route path="/blog/:slug" element={<BlogDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;
