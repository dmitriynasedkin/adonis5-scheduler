import { join } from 'path'
import test from 'japa'
import { Filesystem } from '@poppinss/dev-utils'
import { Application } from '@adonisjs/core/build/standalone'
import Scheduler from '../src/Scheduler'
import { BaseTask } from '../src/Scheduler/Task'
import { Logger } from '@adonisjs/logger/build/standalone'
import { LoggerConfig } from '@ioc:Adonis/Core/Logger'

export const loggerConfig: LoggerConfig = {
	name: 'TEST_APP',
	enabled: true,
	level: 'debug',
	prettyPrint: true,
}

const fs = new Filesystem(join(__dirname, '__app'))
test.group('Scheduler', () => {
	function getApp() {
		const app = new Application(fs.basePath, 'web', {})
		const logger = new Logger(loggerConfig)
		const scheduler = new Scheduler(app, logger)

		return { scheduler }
	}

	test('Should register provider', async (assert) => {
		await fs.add('.env', '')
		await fs.add(
			'config/app.ts',
			`
			export const appKey = 'averylong32charsrandomsecretkey'
			export const http = {
				cookie: {},
				trustProxy: () => true
			}
		`
		)

		const app = new Application(fs.basePath, 'web', {
			providers: ['@adonisjs/core', '../../providers/SchedulerProvider'],
		})

		app.setup()
		app.registerProviders()
		await app.bootProviders()

		assert.instanceOf(app.container.use('Adonis/Addons/Scheduler'), Scheduler)
	})

	let isHandled = false
	test('Should run with good tasks', async (assert) => {
		const { scheduler } = getApp()
		class GoodTask extends BaseTask {
			public static get schedule() {
				return '* * * * * *'
			}

			public static get useLock() {
				return true
			}

			public async handle() {
				const ms = new Date().getTime()
				console.log('handle start', ms)
				await new Promise((resolve) => setTimeout(resolve, 3000))
				isHandled = true
				console.log('handle end', ms)
			}
		}
		await scheduler.run([GoodTask])
		assert.isArray(scheduler.getRegisteredTasks())
		assert.equal(scheduler.getRegisteredTasks().length, 1)

		await new Promise((resolve) => setTimeout(resolve, 10000))
		assert.equal(isHandled, true)
	}).timeout(15000)
})
