import React, { useEffect, useState } from 'react';
import { getPosts } from '../services/storageService';
import { BlogPost, PostStatus } from '../types';
import PostCard from '../components/PostCard';
import { Search, Sparkles } from 'lucide-react';

const Home: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const allPosts = await getPosts();
        // Filter only published posts
        const published = allPosts.filter(p => p.status === PostStatus.PUBLISHED);
        // Sort by date desc
        published.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        setPosts(published);
      } catch (e) {
        console.error("Failed to load posts", e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-500/10 dark:bg-purple-900/10 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-indigo-500/10 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50"></div>
      </div>

      {/* Hero Section */}
      <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
            <img 
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
                alt="Hero Background" 
                className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-50 dark:to-slate-950"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-3xl px-6 mt-10 w-full">
            <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-indigo-200 text-xs font-bold tracking-wider mb-8 shadow-xl">
                <Sparkles size={12} className="text-yellow-300" />
                <span>AI-POWERED STORYTELLING</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-lg">
                Explore the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">Nebula</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
                A modern space for ideas, powered by intelligence. Read, create, and automate your content journey.
            </p>
            
            {/* Floating Search Bar */}
            <div className="max-w-xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search articles, topics, or tags..." 
                        className="w-full pl-12 pr-4 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-2xl placeholder:text-slate-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Content Grid */}
      <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Latest Stories
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">{displayedPosts.length}</span>
            </h2>
        </div>

        {loading ? (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        ) : displayedPosts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedPosts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            
            {visibleCount < filteredPosts.length && (
              <div className="mt-16 text-center">
                <button 
                  onClick={() => setVisibleCount(prev => prev + 6)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all font-medium shadow-sm active:scale-95"
                >
                  Load More Articles
                </button>
              </div>
            )}
          </>
        ) : (
           <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm">
             <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="text-slate-400 dark:text-slate-600" size={32} />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">No posts found</h3>
             <p className="text-slate-500 dark:text-slate-400 mt-2">Try adjusting your search terms or create a new post.</p>
           </div>
        )}
      </main>
    </div>
  );
};

export default Home;