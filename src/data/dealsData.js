// This function simulates fetching data from an API.
// We add a 1.5-second delay to mimic network latency.
export const fetchDeals = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Cozy Winter Blanket",
          originalPrice: 59.99,
          discountedPrice: 39.99,
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQobBFMP1l9rjRrenk-dQwPljVKwH6yT1Gmxg&s",
          // Add an expiry date for the countdown timer
          expiryDate: new Date().getTime() + 2 * 24 * 60 * 60 * 1000, // Expires in 2 days
        },
        {
          id: 2,
          name: "Smart Home Speaker",
          originalPrice: 129.99,
          discountedPrice: 99.99,
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfbBk48GdwCGAl20kBmMTTs_-bU7oFJRZJSw&s",
          expiryDate: new Date().getTime() + 1 * 24 * 60 * 60 * 1000, // Expires in 1 day
        },
        {
          id: 3,
          name: "Wireless Headphones",
          originalPrice: 79.99,
          discountedPrice: 59.99,
          img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKLDD9cbqUiN8t83B5dxdyeW7eYKEYgWxX1w&s",
          expiryDate: new Date().getTime() + 8 * 60 * 60 * 1000, // Expires in 8 hours
        },
      ]);
    }, 1500);
  });
};