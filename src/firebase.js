import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, doc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyApqpXhSEtBsO8sD4q-gRE16zHa4K_syoM",
    authDomain: "tamuhacks.firebaseapp.com",
    projectId: "tamuhacks",
    storageBucket: "tamuhacks.appspot.com",
    messagingSenderId: "237391754705",
    appId: "1:237391754705:web:8e2e19bcae9aa6246fdcf0",
    measurementId: "G-RXEZM9QECF"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Enable persistence
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error('Error setting persistence:', error);
  });

export const uploadEventImage = async (file) => {
  try {
    // Create a unique file name
    const fileName = `${Date.now()}-${file.name}`;
    const storageRef = ref(storage, `event-images/${fileName}`);

    // Create blob from file
    const blob = new Blob([file], { type: file.type });

    // Upload the blob
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name
      }
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw new Error(
      error.code === 'storage/unauthorized'
        ? 'Storage permissions not configured correctly'
        : `Failed to upload image: ${error.message}`
    );
  }
};

// Add this function to fetch a single event
export const getEvent = async (eventId) => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (eventDoc.exists()) {
      return { id: eventDoc.id, ...eventDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Auth functions
export const signUpUser = async (username, email, password) => {
  try {
    // First check if auth is properly initialized
    if (!auth) {
      throw new Error('Authentication not initialized');
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update the user's profile with the username
    await updateProfile(userCredential.user, { 
      displayName: username 
    });
    
    // Create a user document
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      username,
      email,
      createdAt: new Date().toISOString()
    });

    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error in signUpUser:', error);
    let errorMessage = 'Failed to create account.';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'This email is already registered.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
        break;
      case 'auth/weak-password':
        errorMessage = 'Password should be at least 6 characters.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage
    };
  }
};

export const signInUser = async (email, password) => {
  try {
    // First check if auth is properly initialized
    if (!auth) {
      throw new Error('Authentication not initialized');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('Error in signInUser:', error);
    let errorMessage = 'Failed to sign in.';
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Invalid email address.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'This account has been disabled.';
        break;
      case 'auth/user-not-found':
        errorMessage = 'No account found with this email.';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Incorrect password.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error in signOutUser:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Update addEvent to include user info
export const addEvent = async (eventData, imageFile) => {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to create an event');
    }

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadEventImage(imageFile);
    }

    const eventsRef = collection(db, 'events');
    const now = new Date();
    const eventToAdd = {
      ...eventData,
      imageUrl,
      createdBy: {
        uid: auth.currentUser.uid,
        username: auth.currentUser.displayName || 'Anonymous'
      },
      createdAt: now.toISOString(),
      timestamp: now.getTime()
    };

    console.log('Adding event:', eventToAdd); // Add this for debugging
    const docRef = await addDoc(eventsRef, eventToAdd);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding event:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Add update and delete functions
export const updateEvent = async (eventId, updateData, imageFile) => {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to update an event');
    }

    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    if (eventData.createdBy.uid !== auth.currentUser.uid) {
      throw new Error('You can only edit your own events');
    }

    let imageUrl = updateData.imageUrl;
    if (imageFile) {
      imageUrl = await uploadEventImage(imageFile);
    }

    await updateDoc(doc(db, 'events', eventId), {
      ...updateData,
      imageUrl,
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating event:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

export const deleteEvent = async (eventId) => {
  try {
    if (!auth.currentUser) {
      throw new Error('You must be logged in to delete an event');
    }

    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    if (eventData.createdBy.uid !== auth.currentUser.uid) {
      throw new Error('You can only delete your own events');
    }

    await deleteDoc(doc(db, 'events', eventId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting event:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// Update fetchEvents to include user info in the query
export const fetchEvents = async (filterType = 'all') => {
  try {
    const eventsRef = collection(db, 'events');
    let q;
    
    if (filterType === 'all') {
      // For all events, just order by timestamp
      q = query(eventsRef, orderBy('timestamp', 'desc'));
    } else if (filterType === 'my-events' && auth.currentUser) {
      // For user's events
      q = query(
        eventsRef,
        where('createdBy.uid', '==', auth.currentUser.uid),
        orderBy('timestamp', 'desc')
      );
    } else {
      // For filtered events
      q = query(
        eventsRef,
        where('type', '==', filterType),
        orderBy('timestamp', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Filter out past events
    const now = new Date();
    const futureEvents = events.filter(event => {
      const eventEnd = new Date(event.endTime);
      return eventEnd >= now;
    });
    
    console.log('Fetched events:', futureEvents); // Add this for debugging
    return futureEvents;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Add this new function for Google sign-in
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Create a user document if it doesn't exist
    const userRef = collection(db, 'users');
    const q = query(userRef, where('uid', '==', result.user.uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      await addDoc(collection(db, 'users'), {
        uid: result.user.uid,
        username: result.user.displayName,
        email: result.user.email,
        createdAt: new Date().toISOString()
      });
    }

    return { success: true, user: result.user };
  } catch (error) {
    console.error('Error in Google sign-in:', error);
    let errorMessage = 'Failed to sign in with Google.';
    
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        errorMessage = 'Sign-in popup was closed before completing.';
        break;
      case 'auth/popup-blocked':
        errorMessage = 'Sign-in popup was blocked by the browser.';
        break;
      default:
        errorMessage = error.message;
    }
    
    return { 
      success: false, 
      error: errorMessage 
    };
  }
};

// Add this temporary function to delete all events
export const deleteAllEvents = async () => {
  try {
    const eventsRef = collection(db, 'events');
    const querySnapshot = await getDocs(eventsRef);
    
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
    console.log('All events deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting all events:', error);
    return { success: false, error: error.message };
  }
}; 