import { Utensils, Store, Sparkles, Scissors } from 'lucide-react';

export const getShopTypeIcon = (iconName) => {
  const icons = {
    Utensils: Utensils,
    Store: Store,
    Sparkles: Sparkles,
    Scissors: Scissors,
    // Add Spa icon fallback to Sparkles for now
    Spa: Sparkles
  };

  return icons[iconName] || Store;
};

export const shopTypes = [
  { 
    value: "Restaurant", 
    label: "Restaurant",
    icon: "Utensils",
    description: "Perfect for restaurants, cafes, and eateries serving delicious meals to customers. Ideal for showcasing your menu items with images, descriptions, and prices.",
    features: ["Simple Straight Forward"]
  },
  { 
    value: "Food Court", 
    label: "Food Court",
    icon: "Store",
    description: "Manage multiple food stalls or vendors under one roof. Each store can have its own menu, making it perfect for food courts, markets, or collaborative spaces.",
    features: ["Multiple store management", "Individual menus", "Store profiles", "Centralized ordering"]
  }
  
];
// Food Specialties with icons
export const foodSpecialties = [
  {
    id: 'chefRecommended',  // Changed from 'chefs' to match isChefRecommended
    label: "Chef's Choice",
    icon: 'ChefHat',
    bgColor: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    lightBg: 'bg-yellow-100',
    property: 'isChefRecommended'  // Added property name mapping
  },
  {
    id: 'spicy',
    label: "Spicy",
    icon: 'Flame',
    bgColor: 'bg-red-500',
    textColor: 'text-red-600',
    lightBg: 'bg-red-100',
    property: 'isSpicy'
  },

  {
    id: 'popular',
    label: "Popular",
    icon: 'Star',
    bgColor: 'bg-purple-500',
    textColor: 'text-purple-600',
    lightBg: 'bg-purple-100',
    property: 'isPopular'
  }
];


export const availableCategories = [
  { value: "Appetizers", label: "Appetizers" },
  { value: "Main Course", label: "Main Course" },
  { value: "Desserts", label: "Desserts" },
  { value: "Drinks", label: "Drinks" },
  { value: "Specials", label: "Specials" },
  { value: "Sides", label: "Sides" },
  { value: "Breakfast", label: "Breakfast" },
  { value: "Lunch", label: "Lunch" },
  { value: "Dinner", label: "Dinner" },
  { value: "Snacks", label: "Snacks" }
];

export const currencyList = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    decimals: 2,
    country: 'United States',
    language: 'en',
    flag: 'united-states.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    decimals: 0,
    country: 'Indonesia',
    language: 'id',
    flag: 'indonesia.png',
    numberFormat: {
      thousandSeparator: '.',
      decimalSeparator: ',',
    }
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    decimals: 2,
    country: 'Singapore',
    language: 'en',
    flag: 'singapore.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    decimals: 2,
    country: 'Malaysia',
    language: 'ms',
    flag: 'malaysia.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'THB',
    name: 'Thai Baht',
    symbol: '฿',
    decimals: 2,
    country: 'Thailand',
    language: 'th',
    flag: 'thailand.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'VND',
    name: 'Vietnamese Dong',
    symbol: '₫',
    decimals: 0,
    country: 'Vietnam',
    language: 'vi',
    flag: 'vietnam.png',
    numberFormat: {
      thousandSeparator: '.',
      decimalSeparator: ',',
    }
  },
  {
    code: 'PHP',
    name: 'Philippine Peso',
    symbol: '₱',
    decimals: 2,
    country: 'Philippines',
    language: 'fil',
    flag: 'philippines.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'KRW',
    name: 'South Korean Won',
    symbol: '₩',
    decimals: 0,
    country: 'South Korea',
    language: 'ko',
    flag: 'south-korea.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    decimals: 0,
    country: 'Japan',
    language: 'ja',
    flag: 'japan.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    decimals: 2,
    country: 'China',
    language: 'zh',
    flag: 'china.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'HKD',
    name: 'Hong Kong Dollar',
    symbol: 'HK$',
    decimals: 2,
    country: 'Hong Kong',
    language: 'zh',
    flag: 'hong-kong.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  },
  {
    code: 'TWD',
    name: 'New Taiwan Dollar',
    symbol: 'NT$',
    decimals: 0,
    country: 'Taiwan',
    language: 'zh',
    flag: 'taiwan.png',
    numberFormat: {
      thousandSeparator: ',',
      decimalSeparator: '.',
    }
  }
];

// Helper function to format currency based on currency code
export const formatCurrency = (amount, currencyCode) => {
  const currency = currencyList.find(c => c.code === currencyCode) || currencyList[0];
  const { decimals, symbol, numberFormat } = currency;
  
  const formattedNumber = Number(amount)
    .toFixed(decimals)
    .replace(/\d(?=(\d{3})+\.)/g, `$&${numberFormat.thousandSeparator}`);
  
  return `${symbol} ${formattedNumber}`;
};

// Get currency info by code
export const getCurrencyInfo = (currencyCode) => {
  return currencyList.find(currency => currency.code === currencyCode) || currencyList[0];
};

// Get all countries
export const getCountries = () => {
  return currencyList.map(({ country, code, flag, language }) => ({
    country,
    currencyCode: code,
    flag,
    language
  }));
};