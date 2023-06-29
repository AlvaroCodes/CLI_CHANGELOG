const { outro } = require('@clack/prompts')
const colors = require('picocolors')

const fetchData = async (owner = 'IGN-CNIG', repo = 'API-CNIG', brain = 'develop', time = '2023-06-25T00:00:00Z') => {
  const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${brain}&since=${time}`

  try {
    const response = await fetch(url)
    const data = await response.json()
    return data.map(({ commit }) => commit.message)
  } catch (error) {
    if (error) {
      outro(colors.red('Error al obtener los datos de la API-CNIG / GITHUB'))
      process.exit(1)
    }
  }
}

module.exports = {
  fetchData
}
