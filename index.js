#!/usr/bin/env node
'use strict'

const args = require('args')
const download = require('download-git-repo')
const chalk = require('chalk')
const ora = require('ora')
const got = require('got')
const path = require('path')
const inquirer = require('inquirer')
const updateNotifier = require('update-notifier')
const pkg = require('./package')

updateNotifier({pkg}).notify()

args.command(['init'], 'Generate a new project from a template', (name, args) => {
  let github = 'vns-templates'
  let template = args[0]
  let directory = args[1]
  let to = path.resolve(directory || '.')
  let templateName = `${github}/${template}`

  if (directory) {
    generate(templateName, to)
  } else {
    logger()
    inquirer.prompt([{
      type: 'confirm',
      message: 'Generate project in current directory?',
      name: 'ok'
    }]).then((answer) => {
      if (answer.ok) {
        generate(templateName, to)
      }
    })
  }
})

args.command(['list'], 'List available official templates', () => {
  let urlRepository = 'https://api.github.com/users/vns-templates/repos'

  got(urlRepository)
    .then(response => JSON.parse(response.body))
    .then(repositories => {
      if (repositories.length) {
        logger()
        logger('  Available official templates:')
        logger()
        repositories.forEach(function (repo) {
          logger('  ' + chalk.yellow('★') + '  ' + chalk.green(repo.name) + ' - ' + repo.description)
        })
      } else {
        logger()
        logger(chalk.red('No templates available.'))
      }
    })
    .catch(err => {
      logger(chalk.red(err.response.body))
    })
})

const flags = args.parse(process.argv)

if (Object.keys(flags).length !== 0) {
  args.showHelp()
}

function logger (msg) {
  if (msg) {
    console.log(msg)
  } else {
    console.log()
  }
}

function generate (template, dest) {
  logger()
  let spinner = ora('  Please waiting download template.')
  spinner.start()

  download(template, dest, (err) => {
    spinner.stop()

    if (err) {
      logger(chalk.red(`  Failed to download resository ${template} ${err.message}.`))
    } else {
      logger(chalk.green('  Generated successfully!'))
    }
  })
}
