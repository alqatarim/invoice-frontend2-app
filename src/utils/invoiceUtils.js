export const sortbyINVnumberDESC = (array) => {
  if(array?.length > 0){
    array.sort((a, b) => {
      // Convert invoice numbers directly to integers for proper numerical sorting
      const aNum = parseInt(a.invoiceNumber, 10) || 0;
      const bNum = parseInt(b.invoiceNumber, 10) || 0;

      // Sort in descending order (highest number first)
      return bNum - aNum;
    });
    return array;
  }else{
    return [];
  }
}