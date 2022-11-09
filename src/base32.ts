export const convertBase32ToBinary = (base32String: string): string => {
  const base32LookUpTable: {
    [key: string]: string;
  } = {
    A: '00000',
    B: '00001',
    C: '00010',
    D: '00011',
    E: '00100',
    F: '00101',
    G: '00110',
    H: '00111',
    I: '01000',
    J: '01001',
    K: '01010',
    L: '01011',
    M: '01100',
    N: '01101',
    O: '01110',
    P: '01111',
    Q: '10000',
    R: '10001',
    S: '10010',
    T: '10011',
    U: '10100',
    V: '10101',
    W: '10110',
    X: '10111',
    Y: '11000',
    Z: '11001',
    '2': '11010',
    '3': '11011',
    '4': '11100',
    '5': '11101',
    '6': '11110',
    '7': '11111',
  };

  const base32StringInBinary = base32String
    .toUpperCase()
    .split('')
    .map(base32Char => {
      return base32LookUpTable[`${base32Char}`];
    })
    .join('');

  return base32StringInBinary;
};

export const validateBase32String = (base32String: string): boolean => {
  return /^[A-Z2-7]+$/.test(base32String);
};
