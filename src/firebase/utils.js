import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc,
  orderBy,
  limit,
  and
} from 'firebase/firestore';

// Storage imports
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// Config imports
import { db, storage } from './config';

// Re-export needed firestore functions
export { deleteDoc, doc } from 'firebase/firestore';
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

export const trackShopVisit = async (userId, shopData) => {
  try {
    // Check for existing visit first
    const q = query(
      collection(db, 'userVisits'),
      where('userId', '==', userId),
      where('shopId', '==', shopData.id)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update existing visit with new timestamp
      const docRef = querySnapshot.docs[0].ref; // Fixed: Changed snapshot to querySnapshot
      await updateDoc(docRef, { visitedAt: new Date() });
      return docRef;
    }

    // Create new visit if doesn't exist
    const visitRef = await addDoc(collection(db, 'userVisits'), {
      userId,
      shopId: shopData.id,
      shopName: shopData.name,
      shopUsername: shopData.username,
      shopLogo: shopData.squareLogo,
      visitedAt: new Date()
    });
    return visitRef;
  } catch (error) {
    console.error('Error tracking shop visit:', error);
    throw error;
  }
};

// Replace the existing getUserRecentVisits function with this:
export const getUserRecentVisits = async (userId) => {
  try {
    // Get all visits for this user
    const q = query(
      collection(db, 'userVisits'),
      where('userId', '==', userId),
      orderBy('visitedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    // Use Map to keep only most recent visit per shop
    const uniqueVisitsMap = new Map();
    querySnapshot.docs.forEach(doc => {
      const data = { id: doc.id, ...doc.data() };
      if (!uniqueVisitsMap.has(data.shopId) || 
          uniqueVisitsMap.get(data.shopId).visitedAt.seconds < data.visitedAt.seconds) {
        uniqueVisitsMap.set(data.shopId, data);
      }
    });

    // Convert to array, sort by visitedAt, and take only the 3 most recent
    const recentVisits = Array.from(uniqueVisitsMap.values())
      .sort((a, b) => b.visitedAt.seconds - a.visitedAt.seconds)
      .slice(0, 3);

    return recentVisits;
  } catch (error) {
    console.error('Error getting recent visits:', error);
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
export const updateShop = async (shopId, shopData) => {
  try {
    console.log('Starting updateShop with:', { shopId, shopData });
    
    const shopRef = doc(db, 'shops', shopId);
    let updatedData = { ...shopData };

    // Handle square logo upload if provided
    if (shopData.squareLogoFile) {
      console.log('Uploading square logo:', {
        fileName: shopData.squareLogoFile.name,
        fileSize: shopData.squareLogoFile.size,
        fileType: shopData.squareLogoFile.type
      });

      const timestamp = Date.now();
      const squareFileName = `square-logo-${timestamp}`;
      const storageRef = ref(storage, `shops/${shopId}/${squareFileName}`);
      console.log('Square logo storage path:', `shops/${shopId}/${squareFileName}`);
      
      await uploadBytes(storageRef, shopData.squareLogoFile);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Square logo download URL:', downloadURL);
      
      updatedData.squareLogo = downloadURL;

      // Delete old square logo if exists
      if (shopData.previousSquareLogo) {
        console.log('Attempting to delete old square logo:', shopData.previousSquareLogo);
        try {
          const oldLogoRef = ref(storage, shopData.previousSquareLogo);
          await deleteObject(oldLogoRef);
          console.log('Successfully deleted old square logo');
        } catch (error) {
          console.warn('Error deleting old square logo:', error);
        }
      }
    }

    // Handle rectangle logo upload if provided
    if (shopData.rectangleLogoFile) {
      console.log('Uploading rectangle logo:', {
        fileName: shopData.rectangleLogoFile.name,
        fileSize: shopData.rectangleLogoFile.size,
        fileType: shopData.rectangleLogoFile.type
      });

      const timestamp = Date.now();
      const rectangleFileName = `rectangle-logo-${timestamp}`;
      const storageRef = ref(storage, `shops/${shopId}/${rectangleFileName}`);
      console.log('Rectangle logo storage path:', `shops/${shopId}/${rectangleFileName}`);
      
      await uploadBytes(storageRef, shopData.rectangleLogoFile);
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Rectangle logo download URL:', downloadURL);
      
      updatedData.rectangleLogo = downloadURL;

      // Delete old rectangle logo if exists
      if (shopData.previousRectangleLogo) {
        console.log('Attempting to delete old rectangle logo:', shopData.previousRectangleLogo);
        try {
          const oldLogoRef = ref(storage, shopData.previousRectangleLogo);
          await deleteObject(oldLogoRef);
          console.log('Successfully deleted old rectangle logo');
        } catch (error) {
          console.warn('Error deleting old rectangle logo:', error);
        }
      }
    }

    // Remove file objects and previous logo references before saving to Firestore
    delete updatedData.squareLogoFile;
    delete updatedData.rectangleLogoFile;
    delete updatedData.previousSquareLogo;
    delete updatedData.previousRectangleLogo;

    console.log('Final updatedData before saving:', updatedData);
    await updateDoc(shopRef, updatedData);
    return { id: shopId, ...updatedData };
  } catch (error) {
    console.error('Error in updateShop:', error);
    throw error;
  }
}

// Delete shop
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

// Shop Functions
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

// Store Functions
export const createStore = async (shopId, storeData) => {
  try {
    let storeImageUrl = null;
    
    // Upload store image if exists
    if (storeData.storeImageFile) {
      // Generate unique filename using timestamp and original extension
      const timestamp = Date.now();
      const originalName = storeData.storeImageFile.name;
      const extension = originalName.split('.').pop();
      const uniqueFileName = `store_${timestamp}.${extension}`;
      
      const storeImageRef = ref(storage, `stores/${shopId}/${uniqueFileName}`);
      await uploadBytes(storeImageRef, storeData.storeImageFile);
      storeImageUrl = await getDownloadURL(storeImageRef);
    }

    // Clean the data before saving - remove all undefined values
    const { storeImageFile, storeImagePreview, previousStoreImage, ...cleanData } = storeData;

    const storeDoc = {
      ...cleanData,
      shopId,
      storeImage: storeImageUrl || null,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'stores'), storeDoc);
    return { id: docRef.id, ...storeDoc };
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
};

// Get stores by shop ID
export const getStores = async (shopId) => {
  try {
    const q = query(collection(db, 'stores'), where('shopId', '==', shopId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting stores:', error);
    throw error;
  }
};

// Update store
export const updateStore = async (storeId, storeData) => {
  try {
    const storeRef = doc(db, 'stores', storeId);
    let updatedData = { ...storeData };

    // Handle store image upload if provided
    if (storeData.storeImageFile) {
      const storageRef = ref(storage, `stores/${storeData.shopId}/${storeData.storeImageFile.name}`);
      await uploadBytes(storageRef, storeData.storeImageFile);
      updatedData.storeImage = await getDownloadURL(storageRef);

      // Delete old store image if exists
      if (storeData.previousStoreImage) {
        const oldImageRef = ref(storage, storeData.previousStoreImage);
        try {
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('Old store image not found:', error);
        }
      }
    }

    // Clean the data before saving
    const {
      storeImageFile,
      previousStoreImage,
      storeImagePreview,
      ...cleanData
    } = updatedData;

    await updateDoc(storeRef, cleanData);
    return { id: storeId, ...cleanData };
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

// Delete store
export const deleteStore = async (storeId, storeImage) => {
  try {
    // Delete store image if exists
    if (storeImage) {
      const storeImageRef = ref(storage, storeImage);
      try {
        await deleteObject(storeImageRef);
      } catch (error) {
        console.warn('Store image not found:', error);
      }
    }

    // Delete store document
    await deleteDoc(doc(db, 'stores', storeId));
  } catch (error) {
    console.error('Error deleting store:', error);
    throw error;
  }
};

// Menu Items Functions
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

export const updateMenuItem = async (itemId, itemData) => {
  try {
    const itemRef = doc(db, 'menuItems', itemId);
    await updateDoc(itemRef, itemData);
    return { id: itemId, ...itemData };
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