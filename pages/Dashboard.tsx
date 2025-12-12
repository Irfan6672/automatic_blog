import React, { useEffect, useState } from 'react';
import { getPosts, deletePost } from '../services/storageService';
import { BlogPost, PostStatus } from '../types';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Eye, Plus, FileText, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filter, setFilter] = useState<'ALL' | PostStatus>('ALL');
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
        const data = await getPosts();
        setPosts(data);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      await deletePost(id);
      await loadPosts();
    }
  };

  const filteredPosts = filter === 'ALL' ? posts : posts.filter(p => p.status === filter);

  const StatusBadge = ({ status }: { status: PostStatus }) => {
    switch(status) {
        case PostStatus.PUBLISHED: return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit border border-green-200 dark:border-green-900/50"><CheckCircle size={10} /> Published</span>;
        case PostStatus.DRAFT: return <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit border border-amber-200 dark:border-amber-900/50"><FileText size={10} /> Draft</span>;
        case PostStatus.SCHEDULED: return <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 w-fit border border-blue-200 dark:border-blue-900/50"><Clock size={10} /> Scheduled</span>;
        default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your content and analytics</p>
          </div>
          <Link 
            to="/editor" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 transition-all w-fit"
          >
            <Plus size={18} /> New Post
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400">
                  <CheckCircle />
              </div>
              <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.filter(p => p.status === PostStatus.PUBLISHED).length}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Published Posts</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <FileText />
              </div>
              <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{posts.filter(p => p.status === PostStatus.DRAFT).length}</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Drafts</p>
              </div>
           </div>
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Eye />
              </div>
              <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">12.5k</p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Total Views (Mock)</p>
              </div>
           </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
           {['ALL', PostStatus.PUBLISHED, PostStatus.DRAFT].map((f) => (
               <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                      filter === f 
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
               >
                  {f === 'ALL' ? 'All Posts' : f}
               </button>
           ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
             <div className="p-12 text-center text-slate-400 dark:text-slate-500 flex justify-center">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
             </div>
          ) : filteredPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Title</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-600 dark:text-slate-400 text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredPosts.map(post => (
                    <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-900 dark:text-slate-200 line-clamp-1 max-w-md">{post.title}</div>
                         <div className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-1 max-w-xs">{post.excerpt}</div>
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={post.status} /></td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{new Date(post.publishDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex items-center justify-end gap-2">
                             <Link to={`/editor?id=${post.id}`} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded transition-colors">
                                 <Edit2 size={16} />
                             </Link>
                             <button onClick={() => handleDelete(post.id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors">
                                 <Trash2 size={16} />
                             </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
               No posts found. Start writing!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;