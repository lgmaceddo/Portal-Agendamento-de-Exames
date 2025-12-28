/**
 * Substitui placeholders de nome de usuário em um texto
 * Suporta variações como:
 * - meu nome é [nome]
 * - meu nome e [nome]
 * - me chamo [nome]
 * - sou [nome]
 */
export const replaceUserNamePlaceholders = (text: string, userName: string): string => {
  if (!userName || !text) return text;

  const replacements = [
    { pattern: /meu nome (?:é|e) \[nome\]/gi, replacement: `meu nome é ${userName}` },
    { pattern: /me chamo \[nome\]/gi, replacement: `me chamo ${userName}` },
    { pattern: /sou \[nome\]/gi, replacement: `sou ${userName}` },
    { pattern: /\[nome\]/gi, replacement: userName },
  ];

  let result = text;
  replacements.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, replacement);
  });

  return result;
};
