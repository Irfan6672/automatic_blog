import { BlogPost, PostStatus, ScheduleConfig } from '../types';

const DB_NAME = 'NebulaDB';
const DB_VERSION = 1;
const POSTS_STORE = 'posts';
const SCHEDULES_STORE = 'schedules';

// Helper to open the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(POSTS_STORE)) {
        db.createObjectStore(POSTS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(SCHEDULES_STORE)) {
        db.createObjectStore(SCHEDULES_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Generic helper for DB transactions
const dbAction = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T> | void
): Promise<T> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    let request: IDBRequest | undefined; 
    
    try {
        const result = action(store);
        if (result && 'onsuccess' in result) {
            request = result as IDBRequest;
        }
    } catch (e) {
        reject(e);
        return;
    }

    transaction.oncomplete = () => {
        resolve(request ? request.result : undefined as any);
    };
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getPosts = async (): Promise<BlogPost[]> => {
  return dbAction<BlogPost[]>(POSTS_STORE, 'readonly', (store) => store.getAll());
};

export const savePost = async (post: BlogPost): Promise<void> => {
  await dbAction<IDBValidKey>(POSTS_STORE, 'readwrite', (store) => store.put(post));
};

export const deletePost = async (id: string): Promise<void> => {
  return dbAction<void>(POSTS_STORE, 'readwrite', (store) => store.delete(id));
};

export const getPostById = async (id: string): Promise<BlogPost | undefined> => {
  return dbAction<BlogPost>(POSTS_STORE, 'readonly', (store) => store.get(id));
};

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug);
};

export const getSchedules = async (): Promise<ScheduleConfig[]> => {
  return dbAction<ScheduleConfig[]>(SCHEDULES_STORE, 'readonly', (store) => store.getAll());
};

export const saveSchedule = async (schedule: ScheduleConfig): Promise<void> => {
  await dbAction<IDBValidKey>(SCHEDULES_STORE, 'readwrite', (store) => store.put(schedule));
};

export const deleteSchedule = async (id: string): Promise<void> => {
  return dbAction<void>(SCHEDULES_STORE, 'readwrite', (store) => store.delete(id));
};

// Seed data if empty
export const seedInitialData = async () => {
  try {
    const posts = await getPosts();
    if (posts.length === 0) {
      const initialPosts: BlogPost[] = [
        {
          id: '1',
          title: 'Welcome to NebulaBlog',
          excerpt: 'This is an example post to show you what the platform looks like.',
          content: '# Welcome to NebulaBlog\n\nThis is a sample post. You can edit this or create new ones using our **AI-powered** tools.\n\n## Features\n- AI Generation\n- Scheduling\n- Modern UI',
          author: 'Admin',
          publishDate: new Date().toISOString(),
          status: PostStatus.PUBLISHED,
          tags: ['Welcome', 'Update'],
          slug: 'welcome-to-nebulablog',
          coverImage: 'https://picsum.photos/800/400',
          metaDescription: 'Welcome to the new AI blogging platform.'
        }
      ];
      for (const p of initialPosts) {
          await savePost(p);
      }
      console.log("Database seeded.");
    }
  } catch (error) {
    console.error("Failed to seed initial data:", error);
  }
};