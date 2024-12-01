     // utils/formatCurrency.js
     export const formatCurrency = (amount) => {
       return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'USD', // Change to your desired currency
       }).format(amount);
     };