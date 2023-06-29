const colors = require('picocolors')
const { fetchData } = require('./git')
const { readVersion, writeVersion } = require('./version')
const { exitProgram } = require('./util')
const VERSION_TYPES = require('./version-type')

const {
  intro,
  outro,
  text,
  select,
  confirm,
  isCancel
} = require('@clack/prompts')

const createCHANGELOG = async () => {
  const release = readVersion()[0]
  const [timeDoc, version] = release.split(' - Versión ')
  // Pasar fecha formato 2023-06-25T00:00:00Z

  const [time, timeFormat] = await selectDate(timeDoc)
  const dataCommit = await fetchData('IGN-CNIG', 'API-CNIG', 'develop', timeFormat)
  const filterData = await filterCommit(dataCommit)
  const versionSemVer = await selectSemVer(version)
  const changelog = await generateChangelog(filterData, versionSemVer, time)
  writeVersion(changelog)
}

const selectDate = async (timeDoc) => {
  const time = timeDoc.trim()
  const [dia, mes, ano] = time.split('/')

  const defaultDate = await confirm({
    initialValue: true,
    message: colors.cyan(`¿Quieres añadir al CHANGELOG los commit desde ${time}? Esta fecha es la ultima versión que se ha subido a producción.`)
  })

  if (isCancel(defaultDate)) exitProgram({ message: '⚠️ No se ha seleccionado una opción correcta', code: 0 })

  if (defaultDate) {
    return [time, new Date(`${mes}/${dia}/${ano}`).toISOString()]
  } else {
    const date = await text({
      message: colors.cyan('Introduce una fecha manualmente (YYYY-MM-DD):'),
      placeholder: '01/06/2023',
      validate: (value) => {
        const regex = /^\d{2}\/\d{2}\/\d{4}$/
        if (!regex.test(value)) return colors.red('El mensaje no puede estar vacío')
      }

    })

    if (isCancel(date)) exitProgram({ message: '⚠️ No se ha seleccionado una opción correcta', code: 0 })

    return [date, new Date(`${mes}/${dia}/${ano}`).toISOString()]
  }
}

const filterCommit = async (dataCommit) => {
  let data = []
  const defaultDate = await confirm({
    initialValue: true,
    message: colors.cyan('¿Quieres filtrar los commit por [CHANGELOG]?]')
  })

  if (isCancel(defaultDate)) exitProgram({ message: '⚠️ No se ha seleccionado una opción correcta', code: 0 })

  if (defaultDate) {
    data = dataCommit.filter((commit) => commit.includes('[CHANGELOG]'))
  } else {
    const filterWord = await text({
      message: colors.cyan('¿Por qué quieres filtrar los commit?'),
      placeholder: '[CHANGELOG]',
      validate: (value) => {
        if (value.length === 0) return colors.red('El mensaje no puede estar vacío')
        if (value.length > 50) return colors.red('El mensaje no puede tener más de 50 caracteres')
      }

    })

    if (isCancel(filterWord)) exitProgram({ message: '⚠️ No se ha seleccionado una opción correcta', code: 0 })
    data = dataCommit.filter((commit) => commit.includes(filterWord))
  }

  if (data.length === 0) {
    exitProgram({ message: 'No se encontro ningún commit', code: 0 })
  } else {
    return data
  }
}

const selectSemVer = async (version, removeWord) => {
  intro(`La ultima versión fue ${colors.blue(version)}`)

  const [major, mino, patch] = version.split('.')

  const semVerType = await select({
    message: colors.cyan('Selecciona el tipo de commit:'),
    options: Object.entries(VERSION_TYPES).map(([key, value]) => ({
      value: key,
      label: `${value.emoji} ${key.padEnd(8, ' ')} · ${value.description}`
    }))
  })

  if (isCancel(semVerType)) exitProgram('No se ha seleccionado una SemVer', 0)
  if (semVerType === 'major_version') return `${Number(major) + 1}.${mino}.${patch}`
  if (semVerType === 'minor_version') return `${major}.${Number(mino) + 1}.${patch}`
  return `${major}.${mino}.${Number(patch) + 1}`
}

const generateChangelog = async (filterData, versionSemVer, time) => {
  const doc = `${time} - Versión ${versionSemVer}\n${filterData
      .map((commit) => `- ${commit.replace('[CHANGELOG]', '')} \n`).join('')}`

  const shouldContinue = await confirm({
    initialValue: true,
    message: colors.cyan(`¿Quieres crear el CHANGELOG? Previsualización del CHANGELOG: 
        ${colors.green(colors.bold(doc))}`)
  })

  if (!shouldContinue) {
    outro(colors.yellow('No se ha creado el CHANGELOG'))
    process.exit(0)
  }

  if (isCancel(shouldContinue)) exitProgram('No se ha realizado el CHANGELOG.', 0)

  return doc + '\n'
}

module.exports = {
  createCHANGELOG
}
