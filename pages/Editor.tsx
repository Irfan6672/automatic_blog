import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { savePost, getPostById } from '../services/storageService';
import { generateBlogContent, generateBlogImage } from '../services/geminiService';
import { BlogPost, PostStatus } from '../types';
import { Save, Image as ImageIcon, Sparkles, ArrowLeft, Loader2, Eye, Edit3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const Editor: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('id');

  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // AI Prompt State
  const [aiTopic, setAiTopic] = useState('');
  const [showAiModal, setShowAiModal] = useState(!editId);

  // Editor State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    const loadPost = async () => {
        if (editId) {
            setLoading(true);
            try {
                const post = await getPostById(editId);
                if (post) {
                    setTitle(post.title);
                    setContent(post.content);
                    setExcerpt(post.excerpt);
                    setTags(post.tags);
                    setCoverImage(post.coverImage || '');
                    setShowAiModal(false);
                }
            } catch (e) {
                console.error("Failed to load post", e);
            } finally {
                setLoading(false);
            }
        }
    };
    loadPost();
  }, [editId]);

  const handleGenerateAI = async () => {
    if (!aiTopic.trim()) return;
    setGenerating(true);
    try {
      // 1. Generate Text
      const data = await generateBlogContent(aiTopic);
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt);
      setTags(data.tags);
      
      // 2. Generate Image
      try {
         const imageBase64 = await generateBlogImage(data.title);
         setCoverImage(imageBase64);
      } catch (imgErr) {
        console.warn("Image generation failed", imgErr);
      }

      setShowAiModal(false);
    } catch (e) {
      alert("Failed to generate content. Please check your API key or try again.");
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (status: PostStatus) => {
    if (!title) return alert("Title is required");
    
    setLoading(true);
    const newPost: BlogPost = {
      id: editId || Date.now().toString(),
      title,
      content,
      excerpt,
      tags,
      coverImage,
      publishDate: new Date().toISOString(),
      author: 'Admin',
      status,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      metaDescription: excerpt
    };

    try {
        await savePost(newPost);
        navigate('/dashboard');
    } catch(e) {
        alert("Failed to save post");
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  if (loading && editId) {
      return <div className="min-h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-800 dark:text-white hidden sm:block">
            {editId ? 'Edit Post' : 'New Post'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
            <button 
                onClick={() => setPreviewMode(!previewMode)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-sm font-medium"
            >
                {previewMode ? <><Edit3 size={16} /> Edit</> : <><Eye size={16} /> Preview</>}
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2"></div>
            <button 
                onClick={() => handleSave(PostStatus.DRAFT)}
                className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium text-sm"
                disabled={loading}
            >
                Save Draft
            </button>
            <button 
                onClick={() => handleSave(PostStatus.PUBLISHED)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 disabled:opacity-50"
                disabled={loading}
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Publish
            </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 pb-32">
        
        {/* AI Generator Banner/Modal */}
        {showAiModal && !editId && (
          <div className="mb-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900 rounded-2xl p-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Sparkles size={120} />
             </div>
             <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-2 relative z-10">Start with Magic</h2>
             <p className="text-indigo-600/80 dark:text-indigo-300/80 mb-6 max-w-lg mx-auto relative z-10">
               Enter a topic and let our Gemini AI generate a complete, SEO-optimized blog post with images for you.
             </p>
             
             <div className="max-w-xl mx-auto flex gap-2 relative z-10">
               <input 
                 type="text" 
                 value={aiTopic}
                 onChange={(e) => setAiTopic(e.target.value)}
                 placeholder="e.g., The Future of Sustainable Coffee" 
                 className="flex-1 px-4 py-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                 onKeyDown={(e) => e.key === 'Enter' && handleGenerateAI()}
               />
               <button 
                 onClick={handleGenerateAI}
                 disabled={generating || !aiTopic}
                 className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md"
               >
                 {generating ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                 Generate
               </button>
             </div>
             <button 
                onClick={() => setShowAiModal(false)}
                className="mt-4 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline"
             >
                Or write manually from scratch
             </button>
          </div>
        )}

        {/* Main Editor */}
        <div className="space-y-6">
           
           {/* Cover Image */}
           <div className="group relative rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 min-h-[200px] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-indigo-300 dark:hover:border-indigo-700">
              {coverImage ? (
                <>
                  <img src={coverImage} alt="Cover" className="w-full h-full object-cover max-h-[400px]" />
                  <button 
                    onClick={() => setCoverImage('')}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 p-2 rounded-full shadow-md text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                </>
              ) : (
                <div className="text-center p-8">
                   <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Add a cover image</p>
                   <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Paste a URL or generate with AI</p>
                   <div className="flex gap-2 justify-center">
                      <button 
                        onClick={() => {
                            const url = prompt("Enter image URL:");
                            if(url) setCoverImage(url);
                        }}
                        className="text-xs bg-white dark:bg-slate-800 border dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                          Paste URL
                      </button>
                      <button 
                         onClick={async () => {
                             if(!title && !aiTopic) return alert("Enter a title first");
                             setGenerating(true);
                             try {
                                 const img = await generateBlogImage(title || aiTopic);
                                 setCoverImage(img);
                             } catch(e) { alert("Generation failed"); }
                             setGenerating(false);
                         }}
                         disabled={generating}
                         className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 px-3 py-1.5 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/50 flex items-center gap-1"
                      >
                         {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                         Generate AI
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* Title Input */}
           <input
             type="text"
             placeholder="Post Title"
             value={title}
             onChange={(e) => setTitle(e.target.value)}
             className="w-full text-4xl font-extrabold placeholder:text-slate-300 dark:placeholder:text-slate-700 border-none focus:ring-0 px-0 py-4 bg-transparent text-slate-900 dark:text-white"
           />

           {/* Tags & Meta */}
           <div className="flex flex-wrap items-center gap-2 text-sm">
              {tags.map(tag => (
                  <span key={tag} className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md flex items-center gap-1">
                      #{tag}
                      <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-red-500">&times;</button>
                  </span>
              ))}
              <input 
                  type="text" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addTag()}
                  onBlur={addTag}
                  placeholder="Add tags..."
                  className="bg-transparent focus:ring-0 border-none placeholder:text-slate-400 dark:placeholder:text-slate-600 p-0 w-32 text-slate-700 dark:text-slate-300"
              />
           </div>

           {/* Excerpt */}
           <textarea
             placeholder="Write a short excerpt for SEO..."
             value={excerpt}
             onChange={(e) => setExcerpt(e.target.value)}
             className="w-full h-20 bg-slate-50 dark:bg-slate-900 rounded-xl border-none p-4 text-slate-600 dark:text-slate-300 text-sm resize-none focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-shadow"
           />

           {/* Content Editor / Preview */}
           <div className="min-h-[500px] relative">
               {previewMode ? (
                   <div className="prose prose-lg dark:prose-invert prose-indigo max-w-none">
                       <ReactMarkdown>{content}</ReactMarkdown>
                   </div>
               ) : (
                   <textarea
                     placeholder="Write your story here... (Markdown supported)"
                     value={content}
                     onChange={(e) => setContent(e.target.value)}
                     className="w-full h-[600px] resize-y border-none focus:ring-0 text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent p-0 placeholder:text-slate-300 dark:placeholder:text-slate-700 font-serif"
                   />
               )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default Editor;