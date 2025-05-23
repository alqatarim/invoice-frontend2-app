export const sortbyINVnumberDESC = (array) => {
  if(array?.length > 0){
    array.sort((a, b) => {
      if (a.invoiceNumber < b.invoiceNumber) {
          return 1;
      }
      if (a.invoiceNumber > b.invoiceNumber) {
          return -1;
      }
      return 0;
    });
    return array;
  }else{
    return [];
  }
}