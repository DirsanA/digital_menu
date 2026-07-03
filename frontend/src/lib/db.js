let menu = [
  {
    "id": "1",
    "name": "Wagyu Burger",
    "price": 24.5,
    "description": "Premium wagyu beef patty, truffle mayo, caramelized onions, brioche bun.",
    "category": "Mains",
    "tags": ["Popular"],
    "available": true,
    "image": "/images/wagyu_burger.jpg"
  },
  {
    "id": "2",
    "name": "Truffle Fries",
    "price": 12,
    "description": "Crispy shoestring fries tossed in white truffle oil and parmesan.",
    "category": "Starters",
    "tags": ["Vegetarian", "Popular"],
    "available": true,
    "image": "/images/truffle_fries.jpg"
  },
  {
    "id": "3",
    "name": "Wild Salmon",
    "price": 28,
    "description": "Pan-seared wild caught salmon with asparagus and hollandaise.",
    "category": "Mains",
    "tags": ["Healthy", "Gluten-Free"],
    "available": true,
    "image": "/images/wild_salmon.jpg"
  },
  {
    "id": "4",
    "name": "Chocolate Lava Cake",
    "price": 14,
    "description": "Warm molten chocolate cake served with vanilla bean ice cream.",
    "category": "Desserts",
    "tags": ["Vegetarian"],
    "available": true,
    "image": "/images/chocolate_lava_cake.jpg"
  },
  {
    "id": "5",
    "name": "Passionfruit Cooler",
    "price": 8,
    "description": "Refreshing blend of passionfruit, mint, and sparkling water.",
    "category": "Drinks",
    "tags": ["Vegan", "Cold"],
    "available": true,
    "image": "/images/passionfruit_cooler.jpg"
  }
];

let orders = [];

export const getMenu = () => menu;
export const addMenuItem = (item) => {
  const newItem = { id: Date.now().toString(), ...item };
  menu.unshift(newItem);
  return newItem;
};
export const updateMenuItem = (id, updates) => {
  const index = menu.findIndex((m) => m.id === id);
  if (index === -1) return null;
  menu[index] = { ...menu[index], ...updates };
  return menu[index];
};
export const deleteMenuItem = (id) => {
  const index = menu.findIndex((m) => m.id === id);
  if (index === -1) return false;
  menu.splice(index, 1);
  return true;
};

export const getOrders = () => orders;
export const getOrderById = (id) => orders.find((o) => o.id === id);
export const addOrder = (order) => {
  const newOrder = {
    id: Date.now().toString(),
    ...order,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  // Ensure the total is correctly calculated on server side just in case
  const total = newOrder.items.reduce((s, i) => s + i.price * i.quantity, 0) * 1.1; // 10% service
  newOrder.totalAmount = total;
  orders.unshift(newOrder);
  return newOrder;
};
export const updateOrderStatus = (id, status) => {
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return null;
  orders[index].status = status;
  orders[index].updatedAt = new Date().toISOString();
  return orders[index];
};
