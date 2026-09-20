export function spinText(text: string): string {
  // Encontra padrões como {opção1|opção2|opção3} e escolhe um aleatoriamente
  const spintaxRegex = /{([^{}]+)}/g;
  let spinned = text;
  
  while (spintaxRegex.test(spinned)) {
    spinned = spinned.replace(spintaxRegex, (match, p1) => {
      const options = p1.split('|');
      return options[Math.floor(Math.random() * options.length)];
    });
  }
  
  return spinned;
}
