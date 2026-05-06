<<<<<<< HEAD
/**
 * ReachOut MongoDB Bridge
 * This file emulates Firestore functionality but talks to our MongoDB Backend.
 */

const getAuthToken = () => localStorage.getItem('token');

const fetchAPI = async (endpoint: string, options: any = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };
  
  const response = await fetch(endpoint, { ...options, headers });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // localStorage.removeItem('token');
      // window.location.href = '/login';
    }
    const err = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(err.message || 'API Error');
  }
  return response.json();
};

export const db = {
  // Collection emulation
  collection: (dbInstance: any, ...path: string[]) => {
    return { path: path.join('/') };
  },
  
  // Doc emulation
  doc: (dbInstance: any, ...path: string[]) => {
    return { path: path.join('/') };
  },
  
  // Query emulation
  query: (collectionRef: any, ...constraints: any[]) => {
    return { path: collectionRef.path, constraints };
  },
  
  // OrderBy emulation (ignored for now as backend handles it)
  orderBy: (field: string, direction: string = 'asc') => ({ type: 'orderBy', field, direction }),
  
  // Where emulation (ignored for now as backend handles it)
  where: (field: string, op: string, value: any) => ({ type: 'where', field, op, value }),
};

// Snapshot listener emulation (polling for simplicity)
export const onSnapshot = (ref: any, callback: (snapshot: any) => void) => {
  const pathParts = ref.path.split('/');
  const collection = pathParts[0] === 'organizations' ? pathParts[2] || 'organizations' : pathParts[0];
  const id = pathParts[0] === 'organizations' ? pathParts[1] : pathParts[1];

  const fetchData = async () => {
    try {
      const endpoint = id ? `/api/data/${collection}/${id}` : `/api/data/${collection}`;
      const data = await fetchAPI(endpoint);
      
      const snapshot = {
        exists: () => !!data,
        data: () => data,
        docs: Array.isArray(data) ? data.map(d => ({ id: d._id || d.id, data: () => d })) : []
      };
      callback(snapshot);
    } catch (err) {
      console.error(`Error fetching ${ref.path}:`, err);
    }
  };

  fetchData();
  const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
  return () => clearInterval(interval);
};

export const getDoc = async (docRef: any) => {
  const pathParts = docRef.path.split('/');
  const collection = pathParts[0] === 'organizations' ? pathParts[2] || 'organizations' : pathParts[0];
  const id = pathParts[1];
  
  const data = await fetchAPI(`/api/data/${collection}/${id}`);
  return { exists: () => !!data, data: () => data };
};

export const addDoc = async (collectionRef: any, data: any) => {
  const collection = collectionRef.path.split('/').pop();
  return await fetchAPI(`/api/data/${collection}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateDoc = async (docRef: any, data: any) => {
  const pathParts = docRef.path.split('/');
  const collection = pathParts[2] || pathParts[0];
  const id = pathParts[3] || pathParts[1];
  
  return await fetchAPI(`/api/data/${collection}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
};

export const deleteDoc = async (docRef: any) => {
  const pathParts = docRef.path.split('/');
  const collection = pathParts[2] || pathParts[0];
  const id = pathParts[3] || pathParts[1];
  
  return await fetchAPI(`/api/data/${collection}/${id}`, {
    method: 'DELETE'
  });
};

export const setDoc = async (docRef: any, data: any) => {
  return updateDoc(docRef, data);
};

export const writeBatch = () => {
  const operations: any[] = [];
  return {
    set: (docRef: any, data: any) => operations.push({ type: 'set', docRef, data }),
    update: (docRef: any, data: any) => operations.push({ type: 'update', docRef, data }),
    delete: (docRef: any) => operations.push({ type: 'delete', docRef }),
    commit: async () => {
      for (const op of operations) {
        if (op.type === 'set' || op.type === 'update') await updateDoc(op.docRef, op.data);
        if (op.type === 'delete') await deleteDoc(op.docRef);
      }
    }
  };
};
=======
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/reachout';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
>>>>>>> f78d82d23904cb31b9212a813995e1b958994366
