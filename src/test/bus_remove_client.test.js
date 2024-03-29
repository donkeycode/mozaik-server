'use strict'

const chalk = require('chalk')

const Bus = require('../bus')
const loggerMock = require('./logger')

beforeAll(() => {
    chalk.enabled = false
})

it('should remove a registered client from the current list', () => {
    const logger = loggerMock()
    const bus = new Bus({ logger })

    bus.addClient({ id: 'test_client' })
    expect(bus.listClients()).toHaveProperty('test_client')

    bus.removeClient('test_client')
    expect(bus.listClients()).not.toHaveProperty('test_client')

    expect(logger.info).toHaveBeenCalledTimes(2)
    expect(logger.info).toHaveBeenCalledWith('Client #test_client connected')
    expect(logger.info).toHaveBeenCalledWith('Client #test_client disconnected')
})

it('should cleanup subscription and remove timer if no clients left', () => {
    const logger = loggerMock()
    const bus = new Bus({ logger })

    bus.addClient({
        id: 'test_client',
        emit() {},
    })
    expect(bus.listClients()).toHaveProperty('test_client')

    bus.registerApi('test_api', () => ({
        test() {},
    }))
    expect(bus.listApis()).toEqual(['test_api'])

    bus.subscribe('test_client', { id: 'test_api.test' })

    const subscriptions = bus.listSubscriptions()
    expect(subscriptions['test_api.test'].timer).not.toBeUndefined()
    expect(subscriptions['test_api.test']).toHaveProperty('clients')
    expect(subscriptions['test_api.test'].clients).toEqual(['test_client'])

    bus.removeClient('test_client')
    expect(subscriptions['test_api.test'].timer).toBeUndefined()
    expect(subscriptions['test_api.test'].clients).toEqual([])
})
