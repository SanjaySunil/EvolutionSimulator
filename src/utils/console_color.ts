/** Console clearing util. */
export default function console_color(inputString: string, charColorMap: Record<string, string>): string {
  let result = "";

  for (let i = 0; i < inputString.length; i++) {
    const char = inputString[i];
    const color = charColorMap[char] || "\x1b[0m";

    result += `${color}${char}\x1b[0m`;
  }

  return result;
}
