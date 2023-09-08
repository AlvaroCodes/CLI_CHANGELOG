const { outro } = require('@clack/prompts')
const colors = require('picocolors')

// Devuelve los commit filtrados dependiendo de una fecha
const getFilterDate = async (url, date) => {
  console.log('url', url)
  try {
    const response = await fetch(url)
    const data = await response.json()

    // Filtrar por fecha
    const filterDate = data.filter(({ commit }) => {
      const commitDate = new Date(commit.committer.date)
      const dateFilter = new Date(date)
      return commitDate > dateFilter
    })

    // Devolver solo los mensajes
    return filterDate.map(({ commit }) => commit.message)
  } catch (error) {
    if (error) {
      outro(colors.red('Error al obtener los datos de la API-CNIG / GITHUB'))
      process.exit(1)
    }
  }
}

const fetchData = async (owner = 'IGN-CNIG', repo = 'API-CNIG', brain = 'develop', time = '2023-06-25T00:00:00Z', page = 10) => {
  const data = []
  console.log('page', page)
  for (let i = 0; i <= page; i++) {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${brain}&page=${i}&per_page=100`
    const d = await getFilterDate(url, time)
    data.push(...d)
  }

  console.log(data)
  return data
}

module.exports = {
  fetchData
}
