export const generateLotId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `EW-CHN-${year}-${randomStr}`;
};

export const generateTxnId = () => {
  const year = new Date().getFullYear();
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN-${year}-${randomStr}`;
};
