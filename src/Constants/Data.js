import Client1 from "../Assets/Images/client-1.png";
import Client2 from "../Assets/Images/client-2.png";
import Client3 from "../Assets/Images/client-3.png";
import Client4 from "../Assets/Images/client-4.png";
import Client5 from "../Assets/Images/client-5.png";
import Client6 from "../Assets/Images/client-6.png";
import Client7 from "../Assets/Images/client-7.png";
import Client8 from "../Assets/Images/client-8.png";
import Product1 from "../Assets/Images/product.jpg";
import Product2 from "../Assets/Images/product2.jpg";

import asialIcon from "../Assets/Images/member.svg";
import licenseIcon from "../Assets/Images/police.svg";
import certIcon from "../Assets/Images/Certificate.svg";
import insuranceIcon from "../Assets/Images/Insurance.svg";

export const Clients = [
  Client1,
  Client2,
  Client3,
  Client4,
  Client5,
  Client6,
  Client7,
  Client8,
];

const LAPTOP_IMG = "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80";
const PHONE_IMG = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80";
const ACC_IMG = "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80";

const demoProducts = [
  // Laptops (Category 1)
  { id: 101, product_id: 101, name: "ProBook X1", productname: "ProBook X1", price: 999.99, pro_price: 999.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "High performance laptop for professionals.", rating: 4.8, reviews: 124 },
  { id: 102, product_id: 102, name: "Gamer Elite 15", productname: "Gamer Elite 15", price: 1299.99, pro_price: 1299.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "Gaming laptop with dedicated GPU.", rating: 4.6, reviews: 89 },
  { id: 103, product_id: 103, name: "UltraThin Air", productname: "UltraThin Air", price: 899.99, pro_price: 899.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "Lightweight and portable.", rating: 4.9, reviews: 215 },
  { id: 104, product_id: 104, name: "DevStation Pro", productname: "DevStation Pro", price: 1499.99, pro_price: 1499.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "Powerful workstation for developers.", rating: 5.0, reviews: 42 },
  { id: 105, product_id: 105, name: "StudentBook Basic", productname: "StudentBook Basic", price: 499.99, pro_price: 499.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "Affordable laptop for students.", rating: 4.2, reviews: 350 },
  { id: 106, product_id: 106, name: "Convertible 2-in-1", productname: "Convertible 2-in-1", price: 799.99, pro_price: 799.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "Versatile 2-in-1 touchscreen laptop.", rating: 4.5, reviews: 110 },
  { id: 107, product_id: 107, name: "Creator Studio", productname: "Creator Studio", price: 1699.99, pro_price: 1699.99, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80"}], category_id: 1, categoryname: "Laptops", description: "Color accurate display for creators.", rating: 4.7, reviews: 55 },

  // Smartphones (Category 2)
  { id: 201, product_id: 201, name: "SmartPhone X", productname: "SmartPhone X", price: 799.99, pro_price: 799.99, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Flagship smartphone with great camera.", rating: 4.8, reviews: 320 },
  { id: 202, product_id: 202, name: "SmartPhone Y", productname: "SmartPhone Y", price: 699.99, pro_price: 699.99, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Sleek and powerful device.", rating: 4.4, reviews: 185 },
  { id: 203, product_id: 203, name: "SmartPhone Z Pro", productname: "SmartPhone Z Pro", price: 999.99, pro_price: 999.99, image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Pro version with extra features.", rating: 4.9, reviews: 92 },
  { id: 204, product_id: 204, name: "BudgetPhone A", productname: "BudgetPhone A", price: 299.99, pro_price: 299.99, image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Affordable smartphone with basic features.", rating: 4.1, reviews: 450 },
  { id: 205, product_id: 205, name: "Foldable Phone F1", productname: "Foldable Phone F1", price: 1299.99, pro_price: 1299.99, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Innovative foldable display.", rating: 4.6, reviews: 78 },
  { id: 206, product_id: 206, name: "CameraPhone C1", productname: "CameraPhone C1", price: 899.99, pro_price: 899.99, image: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Specialized for photography enthusiasts.", rating: 4.7, reviews: 134 },
  { id: 207, product_id: 207, name: "BatteryMonster B1", productname: "BatteryMonster B1", price: 499.99, pro_price: 499.99, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80"}], category_id: 2, categoryname: "Smartphones", description: "Massive battery for multi-day use.", rating: 4.3, reviews: 275 },

  // Accessories (Category 3)
  { id: 301, product_id: 301, name: "Wireless Earbuds", productname: "Wireless Earbuds", price: 149.99, pro_price: 149.99, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "Noise cancelling wireless earbuds.", rating: 4.5, reviews: 640 },
  { id: 302, product_id: 302, name: "Smart Watch", productname: "Smart Watch", price: 199.99, pro_price: 199.99, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "Track your fitness and notifications.", rating: 4.6, reviews: 412 },
  { id: 303, product_id: 303, name: "Power Bank 20k", productname: "Power Bank 20k", price: 49.99, pro_price: 49.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "High capacity portable charger.", rating: 4.8, reviews: 850 },
  { id: 304, product_id: 304, name: "USB-C Hub", productname: "USB-C Hub", price: 39.99, pro_price: 39.99, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "Expand your connectivity.", rating: 4.4, reviews: 156 },
  { id: 305, product_id: 305, name: "Mechanical Keyboard", productname: "Mechanical Keyboard", price: 109.99, pro_price: 109.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "Tactile mechanical keyboard.", rating: 4.9, reviews: 280 },
  { id: 306, product_id: 306, name: "Wireless Mouse", productname: "Wireless Mouse", price: 59.99, pro_price: 59.99, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "Ergonomic wireless mouse.", rating: 4.7, reviews: 310 },
  { id: 307, product_id: 307, name: "Laptop Sleeve", productname: "Laptop Sleeve", price: 29.99, pro_price: 29.99, image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80", images: [{imgurl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80"}], category_id: 3, categoryname: "Accessories", description: "Protective sleeve for 15-inch laptops.", rating: 4.3, reviews: 185 }
];

const brandsList = ["Hikvision", "CP Plus", "Dahua", "Godrej", "TechStore"];
demoProducts.forEach((p, index) => {
  p.brand = brandsList[index % brandsList.length];
  // Add nested category object so Related Products logic works natively
  p.category = { id: p.category_id, categoryname: p.categoryname };
  
  // Unique Descriptions
  p.pro_description = `Experience the next level of innovation with the ${p.name}. Designed for ${
    p.category_id === 1 ? 'ultimate productivity and seamless multitasking' : 
    p.category_id === 2 ? 'superior connectivity and breathtaking photography' : 
    'enhancing your everyday digital lifestyle'
  }. ${p.description}\n\nCrafted with premium materials, this device delivers a perfect blend of style and performance. Whether you're working, gaming, or staying connected, the ${p.name} ensures you have the power you need, exactly when you need it.`;

  // Unique Specifications
  p.specification = p.category_id === 1 
    ? `Processor: Latest Gen Multi-Core\nMemory: ${16 + (index % 2)*16}GB DDR5\nStorage: ${512 * ((index % 3)+1)}GB NVMe SSD\nDisplay: ${13 + (index % 4)}.3-inch Retina-grade IPS panel\nBattery: Up to ${10 + index} hours` 
    : p.category_id === 2
    ? `Chipset: Bionic Neural Engine\nRAM: ${8 + (index % 2)*4}GB\nStorage: ${128 * ((index % 3)+1)}GB\nCamera: ${48 + (index % 3)*12}MP Main + Ultra-Wide\nBattery: ${4000 + index * 100}mAh with Fast Charging`
    : `Connectivity: Bluetooth 5.${index % 3}\nMaterial: Aerospace-grade aluminum & premium composite\nBattery Life: Up to ${20 + index*5} hours\nCompatibility: Universal across iOS, Android, Windows & Mac`;

  // Unique Weight & Dimensions
  p.weight = {
    length: (p.category_id === 1 ? 30 : p.category_id === 2 ? 15 : 5) + (index % 5),
    width: (p.category_id === 1 ? 20 : p.category_id === 2 ? 7 : 5) + (index % 3),
    height: p.category_id === 1 ? 1.5 : p.category_id === 2 ? 0.8 : 2.5,
    dimension_unit: "cm",
    product_weight: p.category_id === 1 ? (1.2 + (index % 10)*0.1).toFixed(1) : p.category_id === 2 ? (0.15 + (index % 5)*0.01).toFixed(2) : (0.3 + (index % 5)*0.1).toFixed(1),
    weight_unit: "kg"
  };
});

export const fetchProductsByItemTypes = async (selectedItemTypes) => {
  if (selectedItemTypes.length === 0) {
    return [];
  }
  return demoProducts;
};

export const fetchProducts = async (options = {}) => {
  return demoProducts;
};

export const fetchProductById = async (productId) => {
  return demoProducts.find(p => p.id == productId) || demoProducts[0];
};

export const fetchProductsByCategory = async (categoryId) => {
  return demoProducts.filter(p => p.category_id == categoryId);
};

export const cartItems = [
  {
    id: 1,
    name: "Urban Chic",
    quantity: 2,
    price: 3.84,
    image: Product1,
  },
  {
    id: 2,
    name: "Classic Jacket",
    quantity: 1,
    price: 7.84,
    image: Product1,
  },
  {
    id: 3,
    name: "Couture Edge",
    quantity: 1,
    price: 6.74,
    image: Product1,
  },
];

export const carouselData = [
  {
    id: 1,
    title: "We Believe in Quality, Value & Service",
    subtitle: "OUR BELIEF",
    description:
      "We believe all our customers should receive quality, value service and products for the money they spend. At TECHSTORE Alarm System, every solution is designed to maximize your return and peace of mind.",
    buttonText: "Find More",
    buttonLink: "/about",
  },
  {
    id: 2,
    title: "Committed to Your Security & Trust",
    subtitle: "OUR COMMITMENT",
    description:
      "Founded in 2008, TECHSTORE Alarm System delivers integrated solutions including Electronic Security, Automation, Audio/Visual, Data Cabling, and Ducted Vacuum services - built on long-term relationships and customer satisfaction.",
    buttonText: "Who We Are",
    buttonLink: "/about",
  },
  {
    id: 3,
    title: "Who is TECHSTORE Alarm System?",
    subtitle: "SINCE 2008",
    description:
      "We are a privately owned security solutions provider offering end-to-end services in Electronic Security, Automation, Audio/Visual, Data Cabling, and Ducted Vacuum-focused on quality, value, and lasting partnerships.",
    buttonText: "Learn More",
    buttonLink: "/about",
  },
];

export const faqData = [
  {
    question: "How do I protect my personal information when shopping online?",
    answer:
      'Use secure websites (look for "https" in the URL), avoid public Wi-Fi for sensitive transactions, regularly update passwords, and be cautious about sharing unnecessary personal information. Additionally, consider using a virtual private network (VPN) for added security, and monitor your financial statements regularly for any unauthorized transactions. Staying vigilant and adopting secure online practices is key to protecting your personal information.',
  },
  {
    question: "What is the difference between refurbished and new products?",
    answer:
      "Refurbished products have been repaired and tested to ensure functionality. They may show slight wear but are generally more affordable than new items. New products are unused and come in original packaging. When purchasing refurbished items, look for those certified by the manufacturer or a reputable third party to ensure quality and reliability.",
  },
  {
    question: "How can I find out about product recalls?",
    answer:
      "Check the product's official website, the manufacturer's website, or government websites for recalls. You can also sign up for email alerts from consumer protection organizations. Additionally, following the manufacturer and relevant product safety organizations on social media can provide timely updates on recalls and safety concerns.",
  },
  {
    question: "Can I cancel an order after it has been placed?",
    answer:
      "It depends on the retailer and the stage of processing. Quickly contact customer service to inquire about cancellation possibilities. Some retailers have a short window for order cancellations, especially if the order has already been processed or shipped. Being proactive in reaching out can increase the chances of a successful cancellation",
  },
  {
    question: "What should I do if a product arrives damaged?",
    answer:
      "Contact the retailer's customer service immediately. Most retailers have a process for handling damaged or defective items and may offer a replacement or refund. Take clear photos of the damage and provide detailed information to expedite the resolution process. Many retailers prioritize customer satisfaction and will work to resolve the issue promptly.",
  },
  {
    question: "How can I extend the lifespan of electronic devices?",
    answer:
      "Keep devices in a cool and dry place, install software updates regularly, use protective cases, and follow manufacturer recommendations for charging. Avoid exposing devices to extreme temperatures, and consider investing in surge protectors to safeguard against electrical issues.",
  },
  {
    question: "Are online reviews reliable for making purchasing decisions?",
    answer:
      "Online reviews can be helpful, but it's essential to consider the overall sentiment and read multiple reviews. Look for detailed reviews that discuss both positive and negative aspects of the product. Consider the credibility of the source, and be aware that some reviews may be influenced by factors like personal preferences or sponsored content.",
  },
  {
    question: "How do I find the best deals and discounts when shopping online?",
    answer:
      "Subscribe to newsletters, follow retailers on social media, and use price comparison tools. Many retailers also offer discounts for first-time shoppers or during seasonal sales. Additionally, consider browser extensions that automatically apply coupon codes at checkout, maximizing your savings.",
  },
  {
    question: "What is the return policy for most products?",
    answer:
      "Return policies vary by retailer. Typically, there is a specified window (e.g., 30 days) for returns. Check the retailer's website or contact customer service for specific details. Some retailers may offer free returns, while others may deduct return shipping costs from your refund. It's crucial to review the policy before making a purchase to ensure you're comfortable with the terms.",
  },
  {
    question: "How can I track my online order?",
    answer:
      "Most online retailers provide a tracking number in your order confirmation email. You can use this number on the carrier's website to track the status and location of your package. Additionally, some carriers offer detailed tracking information, including estimated delivery times and real-time updates on the package's journey.",
  },
];

export const qaData = [
  {
    question: "Does the dress offer any UV protection?",
    answer:
      "Yes, the dress offers UV protection. It blocks harmful UV rays, providing an additional layer of sun safety.",
  },
  {
    question: "Are there any pockets, and if so, how many and where are they located?",
    answer:
      "Yes, there are pockets. There are two pockets, one on each side of the garment.",
  },
  {
    question: "Is the fabric breathable and quick-drying?",
    answer:
      "Yes, the fabric is breathable, allowing for excellent airflow. Additionally, it is quick-drying, ensuring comfort during and after activities.",
  },
];

export const reviews = [
  {
    name: "John Due",
    date: "10 Aug 2024 11:05 AM",
    rating: 5,
    comment:
      "Wow! This fashion product exceeded all my expectations! From the moment I opened the package, I could tell it was something special. The quality of the materials is outstanding.",
  },
  {
    name: "Rhoda Mayer",
    date: "10 Aug 2024 11:05 AM",
    rating: 5,
    comment:
      "Nice the attention to detail in the craftsmanship is truly impressive. Not only does it look fabulous, but it feels incredibly comfortable too. I've received so many compliments whenever I wear it!",
  },
  {
    name: "Jack Deo",
    date: "10 Aug 2024 11:05 AM",
    rating: 5,
    comment:
      "The product boasts impressive craftsmanship, meticulous attention to detail, and",
  },
];

export const ratingCounts = {
  5: 9,
  4: 7,
  3: 5,
  2: 3,
  1: 1,
};

export const orders = [
  {
    id: 1020,
    date: "06 Jul 2024 03:51PM",
    amount: 61.73,
    status: "Pending",
    method: "COD",
  },
  {
    id: 1017,
    date: "06 Jul 2024 03:15PM",
    amount: 1.97,
    status: "Pending",
    method: "COD",
  },
  {
    id: 1016,
    date: "26 Jun 2024 10:23AM",
    amount: 46.14,
    status: "Pending",
    method: "COD",
  },
  {
    id: 1015,
    date: "25 Jun 2024 06:34PM",
    amount: 18.75,
    status: "Pending",
    method: "COD",
  },
  {
    id: 1013,
    date: "24 Jun 2024 02:29PM",
    amount: 1.72,
    status: "Pending",
    method: "COD",
  },
];

export const refunds = [
  {
    id: 1000,
    status: "Rejected",
    reason: "Item Was Damaged. Also, Fabric Was Not Good As Expected",
    date: "21 Jun 2024",
  },
];

export const wallet = [
  {
    date: "06 Jul 2024 03:15PM",
    amount: 39.4,
    remark: "Wallet Amount Successfully Debited For Order #1017",
    status: "Debit",
  },
  {
    date: "25 Jun 2024 06:34PM",
    amount: 375.0,
    remark: "Wallet Amount Successfully Debited For Order #1015",
    status: "Debit",
  },
  {
    date: "24 Jun 2024 02:29PM",
    amount: 34.44,
    remark: "Wallet Amount Successfully Debited For Order #1013",
    status: "Debit",
  },
  {
    date: "21 Jun 2024 04:29PM",
    amount: 75.21,
    remark: "Wallet Amount Successfully Debited For Order #1010",
    status: "Debit",
  },
];

export const notifications = [
  {
    message:
      "Your order has been successfully placed. Order ID: #1013. Thank you for choosing us.",
    time: "24 Jun 2024 02:29:PM",
  },
  {
    message: "Your Refund request status has been rejected",
    time: "21 Jun 2024 05:42:PM",
  },
  {
    message:
      "Your order has been successfully placed. Order ID: #1012. Thank you for choosing us.",
    time: "21 Jun 2024 05:18:PM",
  },
  {
    message:
      "Your order has been successfully placed. Order ID: #1011. Thank you for choosing us.",
    time: "21 Jun 2024 05:18:PM",
  },
  {
    message:
      "Your order has been successfully placed. Order ID: #1010. Thank you for choosing us.",
    time: "21 Jun 2024 04:29:PM",
  },
  {
    message:
      "Your order has been successfully placed, Order ID: #1009, Thank you for choosing us.",
    time: "21 Jun 2024 04:29:PM",
  },
];

export const whyChooseUsData = [
  {
    title: "ASIAL Silver Corporate Membership",
    desc: "Australian Security Industry Association Ltd (ASIAL). Silver Membership No: C8339.",
    icon: asialIcon,
  },
  {
    title: "Police Security Master License",
    desc: "Police Security Master License No: 000101930. Expiry: 10/2025.",
    icon: licenseIcon,
  },
  {
    title: "Authorized Certifications",
    desc: "Cabling Certification, Dynalite Certifications and Bosch Security Certified Partner.",
    icon: certIcon,
  },
  {
    title: "Insurance & Compensation",
    desc: "Public Liability Insurance for $20 million and Workers Compensation.",
    icon: insuranceIcon,
  },
];