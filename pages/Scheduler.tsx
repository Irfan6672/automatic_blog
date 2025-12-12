import React, { useEffect, useState } from 'react';
import { getSchedules, saveSchedule, deleteSchedule, savePost } from '../services/storageService';
import { generateBlogContent, generateBlogImages } from '../services/geminiService';
import { ScheduleConfig, PostStatus, BlogPost, ContentConfig } from '../types';
import { Calendar, Trash2, Plus, Play, Loader2, RefreshCw, ChevronDown, Image as ImageIcon } from 'lucide-react';

const Scheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleConfig[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Schedule Form
  const [newTopic, setNewTopic] = useState('');
  const [newFreq, setNewFreq] = useState<'daily' | 'weekly'>('daily');
  
  // Advanced Config
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageCount, setImageCount] = useState(1);
  const [includeFaq, setIncludeFaq] = useState(false);
  const [sectionCount, setSectionCount] = useState(3);
  const [useCarousel, setUseCarousel] = useState(false);
  const [imageSource, setImageSource] = useState<'AI' | 'SEARCH' | 'BOTH'>('AI');

  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadSchedules = async () => {
    try {
        const data = await getSchedules();
        setSchedules(data);
    } catch (e) {
        console.error("Failed to load schedules", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleAddSchedule = async () => {
    if (!newTopic) return;

    const contentConfig: ContentConfig = {
        imageCount,
        includeFaq,
        sectionCount,
        useCarousel,
        imageSource
    };

    const newSchedule: ScheduleConfig = {
      id: Date.now().toString(),
      topic: newTopic,
      frequency: newFreq,
      nextRun: new Date().toISOString(),
      enabled: true,
      postsPerRun: 1,
      contentConfig
    };

    await saveSchedule(newSchedule);
    await loadSchedules();
    
    // Reset form
    setNewTopic('');
    setImageCount(1);
    setIncludeFaq(false);
    setSectionCount(3);
    setUseCarousel(false);
    setImageSource('AI');
    setShowAdvanced(false);
  };

  const handleDelete = async (id: string) => {
    await deleteSchedule(id);
    await loadSchedules();
  };

  const handleRunNow = async (schedule: ScheduleConfig) => {
    setProcessingId(schedule.id);
    try {
        const config = schedule.contentConfig;
        
        // 1. Generate Content (includes placeholders if imageCount > 1)
        const data = await generateBlogContent(schedule.topic, config);
        
        // 2. Generate Images
        let images: string[] = [];
        try {
            images = await generateBlogImages(data.title, config);
        } catch(e) { console.warn('Image gen failed'); }

        // 3. Inject Images into Body
        let contentWithImages = data.content;
        
        // Index 0 is the cover image. Indices 1..N are body images.
        // The prompt generates placeholders [[IMAGE_PLACEHOLDER_1]] for image index 1, etc.
        if (images.length > 1) {
            for (let i = 1; i < images.length; i++) {
                const placeholder = `[[IMAGE_PLACEHOLDER_${i}]]`;
                const imgMarkdown = `\n\n![${data.title} - Image ${i}](${images[i]})\n\n`;
                contentWithImages = contentWithImages.replace(placeholder, imgMarkdown);
            }
        }

        // Cleanup any leftover placeholders that might not have been matched (safety)
        contentWithImages = contentWithImages.replace(/\[\[IMAGE_PLACEHOLDER_\d+\]\]/g, '');

        const post: BlogPost = {
            id: Date.now().toString(),
            title: data.title,
            content: contentWithImages,
            excerpt: data.excerpt,
            tags: data.tags,
            coverImage: images[0] || '', 
            images: images,
            author: 'AI Scheduler',
            publishDate: new Date().toISOString(),
            status: PostStatus.PUBLISHED,
            slug: data.suggestedSlug,
            metaDescription: data.metaDescription
        };

        await savePost(post);

        // Update next run time
        const nextDate = new Date();
        if (schedule.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
        if (schedule.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
        
        await saveSchedule({ ...schedule, nextRun: nextDate.toISOString() });
        await loadSchedules();
        
        alert(`Successfully generated post: "${post.title}" with ${images.length} images.`);
    } catch (e) {
        alert("Failed to run scheduled task.");
        console.error(e);
    } finally {
        setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="p-8 max-w-6xl mx-auto">
        <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Auto-Scheduler</h1>
            <p className="text-slate-500 dark:text-slate-400">Configure AI agents to write content for you automatically.</p>
            <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 mt-2 inline-block px-2 py-1 rounded border border-amber-100 dark:border-amber-900/50">
                Note: Tasks execute when you click "Run Now" in this demo.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit sticky top-20">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-5 flex items-center gap-2">
                    <Plus size={18} className="text-indigo-600 dark:text-indigo-400"/> New Task
                </h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Topic / Niche</label>
                        <input 
                            type="text" 
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="e.g. React Tutorials"
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Frequency</label>
                        <select 
                            value={newFreq}
                            onChange={(e: any) => setNewFreq(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white transition-all appearance-none"
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                        </select>
                    </div>

                    {/* Advanced Toggler */}
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-2">
                        <button 
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="flex items-center justify-between w-full text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors py-1"
                        >
                            Advanced Options 
                            <span className={`transform transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`}>
                                <ChevronDown size={16} />
                            </span>
                        </button>
                        
                        <div 
                            className={`grid transition-all duration-300 ease-in-out ${
                                showAdvanced ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                            }`}
                        >
                            <div className="overflow-hidden space-y-5">
                                {/* Image Config */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide flex items-center gap-2">
                                        <ImageIcon size={12} /> Visuals
                                    </label>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Image Count</label>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="5" 
                                                value={imageCount} 
                                                onChange={e => setImageCount(parseInt(e.target.value))} 
                                                className="w-full p-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" 
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Source</label>
                                            <select 
                                                value={imageSource} 
                                                onChange={(e: any) => setImageSource(e.target.value)} 
                                                className="w-full p-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
                                            >
                                                <option value="AI">AI Generated</option>
                                                <option value="SEARCH">Original (Search)</option>
                                                <option value="BOTH">AI & Original</option>
                                            </select>
                                        </div>
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-white dark:hover:bg-slate-800 p-1.5 -mx-1.5 rounded-lg transition-colors">
                                        <input type="checkbox" checked={useCarousel} onChange={e => setUseCarousel(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                                        Use Carousel Layout
                                    </label>
                                </div>

                                {/* Content Config */}
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Content Structure</label>
                                    <div className="mb-3">
                                        <label className="text-xs text-slate-600 dark:text-slate-400 mb-1.5 block">Approx. Sections</label>
                                        <input 
                                            type="number" 
                                            min="1" 
                                            max="15" 
                                            value={sectionCount} 
                                            onChange={e => setSectionCount(parseInt(e.target.value))} 
                                            className="w-full p-2 text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white" 
                                        />
                                    </div>
                                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-white dark:hover:bg-slate-800 p-1.5 -mx-1.5 rounded-lg transition-colors">
                                        <input type="checkbox" checked={includeFaq} onChange={e => setIncludeFaq(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600"/>
                                        Include FAQs
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleAddSchedule}
                        disabled={!newTopic}
                        className="w-full bg-slate-900 dark:bg-indigo-600 text-white py-3 rounded-xl hover:bg-slate-800 dark:hover:bg-indigo-500 transition-colors font-semibold shadow-lg shadow-slate-900/20 dark:shadow-indigo-900/40 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        Create Schedule
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
                {schedules.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">No active schedules</p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm">Create a new task to get started</p>
                    </div>
                ) : (
                    schedules.map(schedule => (
                        <div key={schedule.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300">
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg flex items-center gap-2">
                                    {schedule.topic}
                                    {schedule.contentConfig?.imageSource === 'SEARCH' && <span className="text-[10px] bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded border border-sky-200 dark:border-sky-800 font-bold uppercase tracking-wider">Original</span>}
                                    {schedule.contentConfig?.imageSource === 'BOTH' && <span className="text-[10px] bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded border border-purple-200 dark:border-purple-800 font-bold uppercase tracking-wider">Hybrid</span>}
                                </h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400 mt-2">
                                    <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"><RefreshCw size={12}/> {schedule.frequency}</span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">Next: {new Date(schedule.nextRun).toLocaleDateString()}</span>
                                    {schedule.contentConfig && (
                                        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-3 ml-1">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{schedule.contentConfig.imageCount} img</span>
                                            {schedule.contentConfig.includeFaq && <span className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-1.5 py-0.5 rounded">FAQ</span>}
                                            {schedule.contentConfig.useCarousel && <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded">Carousel</span>}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 self-end md:self-auto">
                                <button 
                                    onClick={() => handleRunNow(schedule)}
                                    disabled={!!processingId}
                                    className="px-5 py-2.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 rounded-xl font-semibold text-sm flex items-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {processingId === schedule.id ? <Loader2 className="animate-spin" size={18}/> : <Play size={18} fill="currentColor" />}
                                    Run Now
                                </button>
                                <button 
                                    onClick={() => handleDelete(schedule.id)}
                                    className="p-2.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default Scheduler;