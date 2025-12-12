import React from 'react';
import { BlogPost } from '../types';
import { Calendar, Clock, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PostCardProps {
  post: BlogPost;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const postLink = `/post/${post.slug}`;
  // Prefer the first image from the array if available, otherwise coverImage
  const displayImage = (post.images && post.images.length > 0) ? post.images[0] : post.coverImage;
  const imageCount = post.images?.length || (post.coverImage ? 1 : 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
      <Link to={postLink} className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 relative block">
        {displayImage ? (
          <img
            src={displayImage}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800">
            No Image
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
            {post.tags.slice(0, 2).map(tag => (
                <span key={tag} className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                    {tag}
                </span>
            ))}
        </div>
        
        {imageCount > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                <ImageIcon size={12} /> {imageCount}
            </div>
        )}
      </Link>
      
      <div className="p-6 flex flex-col flex-1">
        <Link to={postLink}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {post.title}
            </h3>
        </Link>
        
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-3 flex-1 leading-relaxed">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {new Date(post.publishDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
                <Clock size={14} />
                5 min read
            </span>
          </div>
          <Link to={postLink} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-semibold flex items-center gap-1 transition-all">
            Read <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PostCard;