const { outro } = require('@clack/prompts')
const colors = require('picocolors')

function exitProgram ({ message = 'No se ha seleccionado una opción correcta :(', code = 0 }) {
  outro(colors.yellow(message))
  process.exit(code)
}

module.exports = {
  exitProgram
}
