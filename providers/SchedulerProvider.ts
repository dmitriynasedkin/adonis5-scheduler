import Scheduler from '../src/Scheduler'
import { BaseTask } from '../src/Scheduler/Task'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import Logger from '@ioc:Adonis/Core/Logger'

/**
 * Scheduler provider
 */
export default class SchedulerProvider {
	constructor(protected app: ApplicationContract) {}
	public static needsApplication = true

	public register() {
		this.app.container.singleton('Adonis/Addons/Scheduler', () => {
			const logger: typeof Logger = this.app.container.use('Adonis/Core/Logger')

			return new Scheduler(this.app, logger)
		})

		this.app.container.bind('Adonis/Addons/Scheduler/Task', () => BaseTask)
	}
}
