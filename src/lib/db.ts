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
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const response = await fetch(endpoint, { 
      ...options, 
      headers,
      signal: controller.signal 
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
      const err = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(err.message || 'API Error');
    }
    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const collection = (dbInstance: any, ...path: string[]) => {
  return { path: path.join('/') };
};

export const doc = (dbInstance: any, ...path: string[]) => {
  return { path: path.join('/') };
};

export const query = (collectionRef: any, ...constraints: any[]) => {
  return { path: collectionRef.path, constraints };
};

export const orderBy = (field: string, direction: string = 'asc') => ({ type: 'orderBy', field, direction });

export const where = (field: string, op: string, value: any) => ({ type: 'where', field, op, value });

export const db = {
  collection,
  doc,
  query,
  orderBy,
  where,
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
