import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc
} from 'firebase/firestore';

import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

import { db, storage } from './config';

// Add favorite item
export const addFavoriteItem = async (userId, itemData) => {
  try {
    const docRef = await addDoc(collection(db, 'favorites'), {
      userId,
      itemId: itemData.id,
      shopId: itemData.shopId,
      item: itemData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding favorite:', error);
    throw error;
  }
};

// Remove favorite item
export const removeFavoriteItem = async (userId, itemId) => {
  try {
    const q = query(
      collection(db, 'favorites'), 
      where('userId', '==', userId),
      where('itemId', '==', itemId)
    );
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error removing favorite:', error);
    throw error;
  }
};

// Get user's favorite items
export const getFavoriteItems = async (userId) => {
  try {
    const q = query(collection(db, 'favorites'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorites:', error);
    throw error;
  }
};

// Check if item is favorited
export const checkIsFavorited = async (userId, itemId) => {
  try {
    const q = query(
      collection(db, 'favorites'),
      where('userId', '==', userId),
      where('itemId', '==', itemId)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    throw error;
  }
};

// Shop Functions
export const createShop = async (shopData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'shops'), {
      ...shopData,
      userId,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating shop:', error);
    throw error;
  }
};

// Get user's shops
export const getUserShops = async (userId) => {
  try {
    const q = query(collection(db, 'shops'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user shops:', error);
    throw error;
  }
};

// Get shop by ID
export const getShopById = async (shopId) => {
  try {
    const docRef = doc(db, 'shops', shopId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting shop:', error);
    throw error;
  }
};

// Update shop
// Update shop
// Update shop
export const updateShop = async (shopId, shopData) => {
  try {
    const shopRef = doc(db, 'shops', shopId);
    let updatedData = { ...shopData };

    // Handle square logo upload if provided
    if (shopData.squareLogoFile) {
      const storageRef = ref(storage, `shops/${shopId}/square-logo`);
      await uploadBytes(storageRef, shopData.squareLogoFile);
      updatedData.squareLogo = await getDownloadURL(storageRef);

      // Delete old square logo if exists
      if (shopData.previousSquareLogo) {
        const oldLogoRef = ref(storage, shopData.previousSquareLogo);
        try {
          await deleteObject(oldLogoRef);
        } catch (error) {
          console.warn('Old square logo not found:', error);
        }
      }
    }

    // Handle rectangle logo upload if provided
    if (shopData.rectangleLogoFile) {
      const storageRef = ref(storage, `shops/${shopId}/rectangle-logo`);
      await uploadBytes(storageRef, shopData.rectangleLogoFile);
      updatedData.rectangleLogo = await getDownloadURL(storageRef);

      // Delete old rectangle logo if exists
      if (shopData.previousRectangleLogo) {
        const oldLogoRef = ref(storage, shopData.previousRectangleLogo);
        try {
          await deleteObject(oldLogoRef);
        } catch (error) {
          console.warn('Old rectangle logo not found:', error);
        }
      }
    }

    // Remove file objects and previous logo references before saving to Firestore
    delete updatedData.squareLogoFile;
    delete updatedData.rectangleLogoFile;
    delete updatedData.previousSquareLogo;
    delete updatedData.previousRectangleLogo;

    await updateDoc(shopRef, updatedData);
    return { id: shopId, ...updatedData };
  } catch (error) {
    console.error('Error updating shop:', error);
    throw error;
  }
};

// Also update the deleteShop function to handle both logos
export const deleteShop = async (shopId, squareLogoUrl, rectangleLogoUrl) => {
  try {
    // Delete square logo if exists
    if (squareLogoUrl) {
      const squareLogoRef = ref(storage, squareLogoUrl);
      try {
        await deleteObject(squareLogoRef);
      } catch (error) {
        console.warn('Square logo not found:', error);
      }
    }

    // Delete rectangle logo if exists
    if (rectangleLogoUrl) {
      const rectangleLogoRef = ref(storage, rectangleLogoUrl);
      try {
        await deleteObject(rectangleLogoRef);
      } catch (error) {
        console.warn('Rectangle logo not found:', error);
      }
    }

    // Delete all menu items for this shop
    const menuItemsQuery = query(collection(db, 'menuItems'), where('shopId', '==', shopId));
    const menuItemsSnapshot = await getDocs(menuItemsQuery);
    const deletePromises = menuItemsSnapshot.docs.map(doc => deleteMenuItem(doc.id, doc.data().image));
    await Promise.all(deletePromises);

    // Delete shop document
    await deleteDoc(doc(db, 'shops', shopId));
  } catch (error) {
    console.error('Error deleting shop:', error);
    throw error;
  }
};

// Menu Items Functions
// In utils.js
export const addMenuItem = async (shopId, itemData, imageFile) => {
  try {
    let imageUrl = null;
    
    // Upload image if exists
    if (imageFile) {
      const storageRef = ref(storage, `menu-items/${shopId}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      imageUrl = await getDownloadURL(storageRef);
    }

    // Remove the File object before saving to Firestore
    const { imageFile: _, ...cleanItemData } = itemData;

    const menuItemData = {
      ...cleanItemData,
      shopId,
      image: imageUrl,
      createdAt: new Date(),
    };

    const docRef = await addDoc(collection(db, 'menuItems'), menuItemData);
    return { id: docRef.id, ...menuItemData };
  } catch (error) {
    console.error('Error adding menu item:', error);
    throw error;
  }
};

export const updateMenuItem = async (itemId, itemData, imageFile) => {
  try {
    const itemRef = doc(db, 'menuItems', itemId);
    let updatedData = { ...itemData };

    // Handle image upload if new image is provided
    if (imageFile) {
      const storageRef = ref(storage, `menu-items/${itemData.shopId}/${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      updatedData.image = await getDownloadURL(storageRef);

      // Delete old image if exists
      if (itemData.image) {
        const oldImageRef = ref(storage, itemData.image);
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('Old image not found:', error);
        }
      }
    }

    await updateDoc(itemRef, updatedData);
    return { id: itemId, ...updatedData };
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (itemId, imageUrl) => {
  try {
    // Delete image from storage if exists
    if (imageUrl) {
      const imageRef = ref(storage, imageUrl);
      try {
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Image not found:', error);
      }
    }

    // Delete document from Firestore
    await deleteDoc(doc(db, 'menuItems', itemId));
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

export const getMenuItems = async (shopId) => {
  try {
    const q = query(collection(db, 'menuItems'), where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  } catch (error) {
    console.error('Error getting menu items:', error);
    throw error;
  }
};

// Get shop by username
export const getShopByUsername = async (username) => {
  try {
    const q = query(collection(db, 'shops'), where('username', '==', username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting shop by username:', error);
    throw error;
  }
};