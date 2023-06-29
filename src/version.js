const fs = require('fs')
const path = require('path')
const colors = require('picocolors')
const { outro } = require('@clack/prompts')

const readVersion = () => {
  const filePath = path.join(__dirname, 'CHANGELOG')
  const archivo = fs.readFileSync(filePath, 'utf8')

  const regex = /\d{2}\/\d{2}\/\d{4} - Versión \d\.\d\.\d/g
  const matches = archivo.match(regex)

  if (matches !== null) {
    return matches
  } else {
    console.log('No se encontraron coincidencias.')
  }
}

const writeVersion = (version) => {
  const filePath = path.join(__dirname, 'CHANGELOG')
  try {
    const archivo = version + fs.readFileSync(filePath, 'utf8')

    fs.writeFileSync(filePath, archivo, {
      encoding: 'utf8',
      flag: 'w'
    })
    outro(colors.green('CHANGELOG creado con éxito.'))
  } catch (error) {
    console.log('No se ha podido escribir el fichero')
    process.exit(1)
  }
}

module.exports = {
  readVersion,
  writeVersion
}
