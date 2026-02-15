export const sortbyINVnumberDESC = (array) => {
  if (array?.length > 0) {
    array.sort((a, b) => {
      const aNum = parseInt(a.invoiceNumber, 10) || 0;
      const bNum = parseInt(b.invoiceNumber, 10) || 0;
      return bNum - aNum;
    });
    return array;
  } else {
    return [];
  }
};
