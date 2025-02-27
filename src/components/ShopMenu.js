import React, { useState } from 'react';
import Header from './Layout/Header';
import Template1 from './templates/Template1';
import Template2 from './templates/Template2';
import Template3 from './templates/Template3';

const ShopMenu = () => {
  const [selectedTemplate, setSelectedTemplate] = useState('template1');
  
  // Extended sample menu items with a mix of regular and promotional items
  const menuItems = [
    {
      id: 'item-1',
      title: "Spicy Tuna Roll",
      category: "Appetizers",
      price: 12.99,
      promotionalPrice: 9.99,
      description: "Fresh tuna with spicy mayo, cucumber, and avocado",
      isSpicy: true,
      isChefRecommended: true,
      image: "/img/sample/1.jpg",
      preparationTime: "15-20"
    },
    {
      id: 'item-2',
      title: "Grilled Salmon",
      category: "Main Course",
      price: 24.99,
      description: "Atlantic salmon with seasonal vegetables and herbs",
      isChefRecommended: true,
      image: "/img/sample/2.jpg",
      preparationTime: "20-25"
    },
    {
      id: 'item-3',
      title: "Classic Caesar Salad",
      category: "Appetizers",
      price: 10.99,
      description: "Crisp romaine lettuce with traditional Caesar dressing",
      image: "/img/sample/3.jpg",
      preparationTime: "10-15"
    },
    {
      id: 'item-4',
      title: "Beef Tenderloin",
      category: "Main Course",
      price: 34.99,
      promotionalPrice: 29.99,
      description: "Premium cut beef with red wine reduction sauce",
      isChefRecommended: true,
      isPopular: true,
      image: "/img/sample/4.jpg",
      preparationTime: "25-30"
    },
    {
      id: 'item-5',
      title: "Chocolate Lava Cake",
      category: "Desserts",
      price: 8.99,
      description: "Warm chocolate cake with molten center",
      isPopular: true,
      image: "/img/sample/5.jpg",
      preparationTime: "15-20"
    },
    {
      id: 'item-6',
      title: "Green Tea Ice Cream",
      category: "Desserts",
      price: 6.99,
      promotionalPrice: 4.99,
      description: "Traditional Japanese matcha ice cream",
      image: "/img/sample/6.jpg",
      preparationTime: "5"
    },
    {
      id: 'item-7',
      title: "Spicy Ramen",
      category: "Main Course",
      price: 16.99,
      description: "Hot and spicy ramen with pork belly",
      isSpicy: true,
      isPopular: true,
      image: "/img/sample/7.jpg",
      preparationTime: "15-20"
    },
    {
      id: 'item-8',
      title: "Fresh Fruit Smoothie",
      category: "Drinks",
      price: 7.99,
      description: "Blend of seasonal fruits with yogurt",
      image: "/img/sample/8.jpg",
      preparationTime: "5-10"
    },
    {
      id: 'item-9',
      title: "Premium Coffee",
      category: "Drinks",
      price: 4.99,
      promotionalPrice: 3.99,
      description: "Freshly brewed premium coffee beans",
      isPopular: true,
      image: "/img/sample/9.jpg",
      preparationTime: "5"
    },
    {
      id: 'item-10',
      title: "Vegetable Tempura",
      category: "Appetizers",
      price: 11.99,
      description: "Assorted vegetables in light crispy batter",
      image: "/img/sample/10.jpg",
      preparationTime: "15-20"
    }
  ];

  // Extract unique categories from menu items
  const uniqueCategories = [...new Set(menuItems.map(item => item.category))];
  
  // Define a mock shop for the sample data with categories
  const sampleShop = {
    id: 'sample-shop',
    name: 'Sample Restaurant',
    username: 'sample-restaurant',
    defaultTemplate: 'template1',
    squareLogo: '/img/sample/logo-square.jpg',
    rectangleLogo: '/img/sample/logo-rectangle.jpg',
    categories: uniqueCategories // Add categories here
  };

  // Ensure each menu item has the shop data embedded
  const menuItemsWithShop = menuItems.map(item => ({
    ...item,
    shopId: sampleShop.id,
    shop: sampleShop
  }));

  const renderTemplate = () => {
    const props = {
      menuItems: menuItemsWithShop,
      shop: sampleShop,
      isPreview: false
    };

    switch (selectedTemplate) {
      case 'template2':
        return <Template2 {...props} />;
      case 'template3':
        return <Template3 {...props} />;
      default:
        return <Template1 {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onTemplateChange={setSelectedTemplate} 
        currentTemplate={selectedTemplate}
        shop={sampleShop} 
      />
      {renderTemplate()}
    </div>
  );
};

export default ShopMenu;