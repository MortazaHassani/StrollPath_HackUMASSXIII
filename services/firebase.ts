





import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { Route, User } from '../types';

// IMPORTANT:
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Go to Project Settings > General and find your web app's configuration.
// 3. Create a `.env` file in the root of your project.
// 4. Add your Firebase config to the `.env` file like this:
//    REACT_APP_FIREBASE_API_KEY="your-api-key"
//    REACT_APP_FIREBASE_AUTH_DOMAIN="your-auth-domain"
//    REACT_APP_FIREBASE_PROJECT_ID="your-project-id"
//    REACT_APP_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
//    REACT_APP_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
//    REACT_APP_FIREBASE_APP_ID="your-app-id"

const firebaseConfig = {
  apiKey: "AIzaSyCVaX3GANQbiDBkE4tI-tRCM2Q1KiIkujU",
  authDomain: "strollpath-9f35f.firebaseapp.com",
  projectId: "strollpath-9f35f",
  storageBucket: "strollpath-9f35f.appspot.com",
  messagingSenderId: "221002687194",
  appId: "1:221002687194:web:7819747c3b9bee4a34fbe3",
  measurementId: "G-MZL4H6B4TX"
};

// Initialize Firebase
if (firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    firebase.firestore().enablePersistence()
      .catch((err) => {
          if (err.code == 'failed-precondition') {
              // Multiple tabs open, persistence can only be enabled
              // in one tab at a time.
              console.warn('Firestore persistence failed: multiple tabs open.');
          } else if (err.code == 'unimplemented') {
              // The current browser does not support all of the
              // features required to enable persistence
              console.warn('Firestore persistence not available in this browser.');
          }
      });
}


// Initialize Firebase Authentication and get a reference to the service
export const auth = firebase.auth();
export const db = firebase.firestore();
const FieldValue = firebase.firestore.FieldValue;


const googleProvider = new firebase.auth.GoogleAuthProvider();

export const signInWithGoogle = () => {
  return auth.signInWithPopup(googleProvider);
};

export const createUser = async (name:string, email:string, password:string):Promise<firebase.auth.UserCredential> => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  if (userCredential.user) {
    await userCredential.user.updateProfile({
      displayName: name,
    });
  }
  return userCredential;
};

export const signInWithEmail = (email:string, password:string):Promise<firebase.auth.UserCredential> => {
  return auth.signInWithEmailAndPassword(email, password);
};

export const updateUserProfile = (user: FirebaseUser, profile: { displayName?: string; photoURL?: string; }) => {
  return user.updateProfile(profile);
};


export const signOutUser = () => {
  return auth.signOut();
};

export type FirebaseUser = firebase.User;

export const getOrCreateUserProfile = async (user: FirebaseUser): Promise<User> => {
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();

    if (doc.exists) {
        // Ensure existing users have new fields with default values
        const data = doc.data() as User;
        const updates: Partial<User> = {};
        if (data.dailyStepGoal === undefined) {
            updates.dailyStepGoal = 10000;
        }
        if (data.activity === undefined) {
            updates.activity = {};
        }
        if (Object.keys(updates).length > 0) {
            await userRef.update(updates);
            return { ...data, ...updates };
        }
        return data;
    } else {
        const newUserProfile: User = {
            id: user.uid,
            name: user.displayName || 'Stroller',
            imageUrl: user.photoURL || null,
            following: [],
            followers: [],
            isSearchable: true,
            likedRoutes: [],
            dailyStepGoal: 10000,
            activity: {},
        };
        await userRef.set(newUserProfile);
        return newUserProfile;
    }
};

export const updateUserDocument = (userId: string, data: object) => {
    return db.collection('users').doc(userId).update(data);
};

// Type guard for User
const isValidUser = (user: any): user is User => {
    return user &&
        typeof user.id === 'string' &&
        typeof user.name === 'string' &&
        Array.isArray(user.following) &&
        Array.isArray(user.followers);
};

// Type guard for Route
const isValidRoute = (route: any): route is Omit<Route, 'isLiked'> => {
    return route &&
        typeof route.id === 'string' &&
        typeof route.name === 'string' &&
        typeof route.distance === 'number' &&
        Array.isArray(route.tags) &&
        typeof route.authorId === 'string';
};

export const fetchAllData = async (currentUserId: string): Promise<{ users: User[], routes: Route[] }> => {
    const usersSnapshot = await db.collection('users').get();
    const routesSnapshot = await db.collection('routes').orderBy('createdAt', 'desc').get();
    
    const allUsers = usersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    const users = allUsers.filter(isValidUser);
    
    if (users.length !== allUsers.length) {
        console.warn('Some user documents were malformed and have been filtered out.');
    }

    const currentUser = users.find(u => u.id === currentUserId);
    const likedRoutesSet = new Set(currentUser?.likedRoutes || []);

    const allRoutes = routesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));

    const validRoutes = allRoutes.filter(isValidRoute);
    if(validRoutes.length !== allRoutes.length) {
        console.warn('Some route documents were malformed and have been filtered out.');
    }

    const routes = validRoutes.map(route => {
        return {
            ...route,
            isLiked: likedRoutesSet.has(route.id),
        } as Route;
    });

    return { users, routes };
};

export const addRouteToDb = async (routeData: Omit<Route, 'id'|'likes'|'isLiked'>) => {
    const routeWithDefaults = {
        ...routeData,
        likes: 0,
        createdAt: FieldValue.serverTimestamp(),
    };
    const docRef = await db.collection('routes').add(routeWithDefaults);
    return {
        ...routeData, // createdAt will be null locally but that's ok
        id: docRef.id,
        likes: 0,
        isLiked: false,
    };
};

export const updateRouteInDb = (routeId: string, data: Partial<Route>) => {
    return db.collection('routes').doc(routeId).update(data);
};

export const toggleLikeInDb = (userId: string, routeId: string, isCurrentlyLiked: boolean) => {
    const userRef = db.collection('users').doc(userId);
    const routeRef = db.collection('routes').doc(routeId);
    
    return db.runTransaction(async (transaction) => {
        const routeDoc = await transaction.get(routeRef);
        if (!routeDoc.exists) {
            throw "Route does not exist!";
        }
        
        if (isCurrentlyLiked) {
            transaction.update(userRef, { likedRoutes: FieldValue.arrayRemove(routeId) });
            transaction.update(routeRef, { likes: FieldValue.increment(-1) });
        } else {
            transaction.update(userRef, { likedRoutes: FieldValue.arrayUnion(routeId) });
            transaction.update(routeRef, { likes: FieldValue.increment(1) });
        }
    });
};

export const toggleFollowInDb = (currentUserId: string, targetUserId: string, isCurrentlyFollowing: boolean) => {
    const currentUserRef = db.collection('users').doc(currentUserId);
    const targetUserRef = db.collection('users').doc(targetUserId);

    return db.runTransaction(async (transaction) => {
        if (isCurrentlyFollowing) {
            // Unfollow
            transaction.update(currentUserRef, { following: FieldValue.arrayRemove(targetUserId) });
            transaction.update(targetUserRef, { followers: FieldValue.arrayRemove(currentUserId) });
        } else {
            // Follow
            transaction.update(currentUserRef, { following: FieldValue.arrayUnion(targetUserId) });
            transaction.update(targetUserRef, { followers: FieldValue.arrayUnion(currentUserId) });
        }
    });
};

export const seedDatabase = async () => {
    const routesRef = db.collection('routes');
    const routesSnapshot = await routesRef.limit(1).get();

    if (routesSnapshot.empty) {
        console.log("Routes collection is empty, seeding with initial data.");

        const strollBot: User = {
            id: 'stroll-bot-user',
            name: 'Stroll Bot',
            imageUrl: null,
            following: [],
            followers: [],
            isSearchable: false, // Don't let bot appear in user search
            likedRoutes: [],
        };
        
        await db.collection('users').doc(strollBot.id).set(strollBot).catch(err => console.error("Error seeding bot user:", err));

        const seedRoutes: Omit<Route, 'id'|'likes'|'isLiked'>[] = [
            {
                name: "Puffer's Pond Nature Trail",
                description: "A serene walk around the beautiful Puffer's Pond. Perfect for nature lovers, with opportunities for swimming in the summer. Mostly flat and family-friendly.",
                distance: 1.6,
                estimatedTime: 32,
                path: [{lat: 42.4005, lng: -72.5023}, {lat: 42.4018, lng: -72.5035}, {lat: 42.4031, lng: -72.5019}, {lat: 42.4015, lng: -72.4998}],
                isPublic: true,
                tags: ["nature", "pond", "easy", "family-friendly"],
                authorId: strollBot.id,
                imageUrl: 'https://images.unsplash.com/photo-1552318965-6e6b74820b33?w=400&h=400&fit=crop&q=80&auto=format',
            },
            {
                name: "Amherst College Campus Stroll",
                description: "Explore the historic and beautiful Amherst College campus. Walk past stunning architecture, the bird sanctuary, and the sprawling main quad.",
                distance: 1.9,
                estimatedTime: 38,
                path: [{lat: 42.371, lng: -72.518}, {lat: 42.373, lng: -72.519}, {lat: 42.374, lng: -72.516}, {lat: 42.372, lng: -72.515}],
                isPublic: true,
                tags: ["historic", "architecture", "easy", "campus"],
                authorId: strollBot.id,
                imageUrl: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=400&h=400&fit=crop&q=80&auto=format',
            },
             {
                name: "Norwottuck Rail Trail Adventure",
                description: "A long, flat, paved path perfect for walking, jogging, or biking. This section takes you through peaceful woodlands towards the Connecticut River.",
                distance: 5,
                estimatedTime: 100,
                path: [{lat: 42.348, lng: -72.55}, {lat: 42.348, lng: -72.56}, {lat: 42.349, lng: -72.57}, {lat: 42.349, lng: -72.58}],
                isPublic: true,
                tags: ["flat", "paved", "scenic", "long"],
                authorId: strollBot.id,
                imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=400&h=400&fit=crop&q=80&auto=format',
            }
        ];

        for (const route of seedRoutes) {
            const routeWithDefaults = { ...route, likes: 0, createdAt: FieldValue.serverTimestamp() };
            await db.collection('routes').add(routeWithDefaults).catch(err => console.error("Error seeding route:", err));
        }
        
        console.log("Database seeded.");
    }
};