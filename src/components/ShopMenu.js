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
      id: 1,
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
      id: 2,
      title: "Grilled Salmon",
      category: "Main Course",
      price: 24.99,
      description: "Atlantic salmon with seasonal vegetables and herbs",
      isChefRecommended: true,
      image: "/img/sample/2.jpg",
      preparationTime: "20-25"
    },
    {
      id: 3,
      title: "Classic Caesar Salad",
      category: "Appetizers",
      price: 10.99,
      description: "Crisp romaine lettuce with traditional Caesar dressing",
      image: "/img/sample/3.jpg",
      preparationTime: "10-15"
    },
    {
      id: 4,
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
      id: 5,
      title: "Chocolate Lava Cake",
      category: "Desserts",
      price: 8.99,
      description: "Warm chocolate cake with molten center",
      isPopular: true,
      image: "/img/sample/5.jpg",
      preparationTime: "15-20"
    },
    {
      id: 6,
      title: "Green Tea Ice Cream",
      category: "Desserts",
      price: 6.99,
      promotionalPrice: 4.99,
      description: "Traditional Japanese matcha ice cream",
      image: "/img/sample/6.jpg",
      preparationTime: "5"
    },
    {
      id: 7,
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
      id: 8,
      title: "Fresh Fruit Smoothie",
      category: "Drinks",
      price: 7.99,
      description: "Blend of seasonal fruits with yogurt",
      image: "/img/sample/8.jpg",
      preparationTime: "5-10"
    },
    {
      id: 9,
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
      id: 10,
      title: "Vegetable Tempura",
      category: "Appetizers",
      price: 11.99,
      description: "Assorted vegetables in light crispy batter",
      image: "/img/sample/10.jpg",
      preparationTime: "15-20"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onTemplateChange={setSelectedTemplate} 
        currentTemplate={selectedTemplate} 
      />
      {selectedTemplate === 'template1' && <Template1 menuItems={menuItems} />}
      {selectedTemplate === 'template2' && <Template2 menuItems={menuItems} />}
      {selectedTemplate === 'template3' && <Template3 menuItems={menuItems} />}
    </div>
  );
};

export default ShopMenu;