import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../services/storageService';
import { BlogPost as BlogPostType } from '../types';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';

const BlogPost: React.FC = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      if (slug) {
        const foundPost = await getPostBySlug(slug);
        setPost(foundPost || null);
      }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  if (loading) return <div className="p-20 text-center flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  
  if (!post) return (
    <div className="p-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Post not found</h2>
        <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium underline">Return Home</Link>
    </div>
  );

  // Determine images to show
  const images = post.images && post.images.length > 0 ? post.images : (post.coverImage ? [post.coverImage] : []);
  const hasMultipleImages = images.length > 1;

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <article className="min-h-screen bg-white dark:bg-slate-950 pb-20 transition-colors duration-300">
       {/* Hero/Cover with Carousel */}
       <div className="h-[300px] md:h-[500px] w-full relative group bg-slate-900 overflow-hidden">
         {images.length > 0 ? (
           <>
               <div 
                  className="w-full h-full flex transition-transform duration-500 ease-in-out" 
                  style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
               >
                  {images.map((img, idx) => (
                      <div key={idx} className="min-w-full h-full relative">
                           <img src={img} alt={`${post.title} - ${idx + 1}`} className="w-full h-full object-cover opacity-90" />
                           {/* Gradient Overlay */}
                           <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent"></div>
                      </div>
                  ))}
               </div>

               {/* Carousel Controls */}
               {hasMultipleImages && (
                   <>
                       <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                           <ChevronLeft size={24} />
                       </button>
                       <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100">
                           <ChevronRight size={24} />
                       </button>
                       <div className="absolute bottom-4 right-6 flex gap-1.5 z-20">
                           {images.map((_, idx) => (
                               <button 
                                  key={idx} 
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'}`} 
                               />
                           ))}
                       </div>
                   </>
               )}
           </>
         ) : (
           <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-300 dark:text-slate-600 text-5xl font-bold">Nebula</div>
         )}
         
         <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-5xl mx-auto z-10 pointer-events-none">
            <div className="flex flex-wrap gap-2 mb-6 pointer-events-auto">
               {post.tags.map(tag => (
                   <span key={tag} className="bg-indigo-500/80 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg tracking-wide uppercase border border-indigo-400/30">{tag}</span>
               ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight shadow-sm drop-shadow-md text-balance">{post.title}</h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium text-sm md:text-base pointer-events-auto">
               <div className="flex items-center gap-2 text-white"><User size={18} className="text-indigo-400" /> {post.author}</div>
               <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-500"></div>
               <div className="flex items-center gap-2"><Calendar size={18} className="text-indigo-400" /> {new Date(post.publishDate).toLocaleDateString()}</div>
               <div className="hidden md:block w-1.5 h-1.5 rounded-full bg-slate-500"></div>
               <div className="flex items-center gap-2"><Clock size={18} className="text-indigo-400" /> 5 min read</div>
            </div>
         </div>
       </div>

       {/* Content Container */}
       <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-10">
          <div className="bg-white dark:bg-slate-900 rounded-t-3xl p-8 md:p-16 shadow-2xl border border-slate-100 dark:border-slate-800 transition-colors">
             <Link to="/" className="inline-flex items-center gap-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 mb-10 transition-colors font-semibold group/back">
                <ArrowLeft size={20} className="group-hover/back:-translate-x-1 transition-transform" /> Back to Home
             </Link>
             
             {/* Markdown Content */}
             <div className="prose prose-lg md:prose-xl dark:prose-invert prose-slate prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-img:rounded-xl max-w-none">
                <ReactMarkdown>{post.content}</ReactMarkdown>
             </div>
             
             <div className="mt-16 pt-10 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div className="text-slate-400 dark:text-slate-500 text-sm">
                     Published on {new Date(post.publishDate).toLocaleDateString()}
                 </div>
             </div>
          </div>
       </div>
    </article>
  );
};
export default BlogPost;