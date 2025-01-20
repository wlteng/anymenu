// utils.js
import { getShopByUsername } from '../../../firebase/utils';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

export const loadShop = async (username, setShop, showToast, navigate) => {
  try {
    const shopData = await getShopByUsername(username);
    if (!shopData) {
      showToast({
        title: 'Error',
        description: 'Shop not found',
        type: 'error'
      });
      navigate('/my-shops');
      return;
    }
    setShop(shopData);
  } catch (error) {
    showToast({
      title: 'Error',
      description: 'Failed to load shop data',
      type: 'error'
    });
  }
};

export const loadItem = async (itemId, setFormData, setIsEditMode, showToast) => {
  try {
    const docRef = doc(db, 'menuItems', itemId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const itemData = docSnap.data();

      // Ensure variants data is properly formatted
      const variants = itemData.variants || [];
      const formattedVariants = variants.map(variant => ({
        ...variant,
        id: variant.id || Date.now(),
        price: variant.price?.toString() || '',
        promotionalPrice: variant.promotionalPrice?.toString() || ''
      }));

      setFormData({
        ...itemData,
        imagePreview: itemData.image,
        promotionalPrice: itemData.promotionalPrice?.toString() || '',
        preparationTime: itemData.preparationTime || '',
        itemCode: itemData.itemCode || '',
        price: itemData.price?.toString() || '',
        variants: formattedVariants,
        hasAllergens: itemData.hasAllergens || false,     // Added
        allergyNote: itemData.allergyNote || ''           // Added
      });
      setIsEditMode(true);
    }
  } catch (error) {
    showToast({
      title: 'Error',
      description: 'Failed to load item data',
      type: 'error'
    });
  }
};