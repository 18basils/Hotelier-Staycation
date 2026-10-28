import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    projectId: process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT_ID || 'hotelierstays'
  });
}

export const db = getFirestore();

// Collection References
export const usersCol = db.collection('users');
export const placesCol = db.collection('places');
export const hotelsCol = db.collection('hotels');
export const categoriesCol = db.collection('categories');
export const roomsCol = db.collection('rooms');
export const reservationsCol = db.collection('reservations');
export const reviewsCol = db.collection('reviews');
export const couponsCol = db.collection('coupons');

export default db;
