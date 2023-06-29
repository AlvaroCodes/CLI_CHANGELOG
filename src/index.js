const colors = require('picocolors')
const { intro } = require('@clack/prompts')

const { createCHANGELOG } = require('./createCHANGELOG')

const main = async () => {
  // flag create CHANGELOG
  intro(
    colors.inverse(`${colors.blue(' Creación del CHANGELOG de la API-CNIG ')}`))
  await createCHANGELOG()
}

main()
