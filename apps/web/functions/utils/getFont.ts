export default async function getFont(origin: string) {
  const url = origin + '/fonts/Dosis-Regular.ttf'
  const font = await fetch(url)
  return font.arrayBuffer()
}
