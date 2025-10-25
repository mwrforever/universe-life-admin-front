// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Custom commands for auth
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: '/api/v1/auth/login',
    body: { username, password },
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token)
  })
})

Cypress.Commands.add('loginAsAdmin', () => {
  cy.login('admin', 'admin123')
})

Cypress.Commands.add('loginAsMerchant', () => {
  cy.login('merchant', 'merchant123')
})

Cypress.Commands.add('loginAsWorker', () => {
  cy.login('worker', 'worker123')
})

// Custom commands for tasks
Cypress.Commands.add('createTask', (taskData: any) => {
  cy.request({
    method: 'POST',
    url: '/api/v1/tasks',
    headers: {
      Authorization: `Bearer ${window.localStorage.getItem('token')}`,
    },
    body: taskData,
  })
})

// Add socket.io mocking
Cypress.Commands.add('mockSocket', () => {
  cy.window().then((win) => {
    // Mock socket.io client
    win.io = {
      connect: cy.stub().returns({
        emit: cy.stub(),
        on: cy.stub(),
        off: cy.stub(),
        disconnect: cy.stub(),
      }),
    }
  })
})