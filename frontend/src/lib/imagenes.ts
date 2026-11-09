// Las imágenes se guardan como data URLs en el cliente (aún no hay subida a servidor).
function leerComoDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result as string)
    lector.onerror = () => reject(lector.error)
    lector.readAsDataURL(file)
  })
}

// Lee los ficheros de un <input type="file"> y vacía el input para poder reelegir el mismo fichero.
export async function leerImagenes(input: HTMLInputElement): Promise<string[]> {
  const files = Array.from(input.files ?? [])
  input.value = ''
  return Promise.all(files.map(leerComoDataUrl))
}
