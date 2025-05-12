     // utils/formatCurrency.js
     export const formatCurrency = (amount) => {
       return new Intl.NumberFormat('en-US', {
         style: 'currency',
         currency: 'SAR', // Change to your desired currency
       }).format(amount);
     };