// Custom commands for the application

// This file gets automatically imported when running Cypress with `cypress run`
// or `cypress open`. You can also include this file in other files using:
// import './commands'

// Example command:
// Cypress.Commands.add('login', (email, password) => { ... })

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>
      loginAsAdmin(): Chainable<void>
      loginAsMerchant(): Chainable<void>
      loginAsWorker(): Chainable<void>
      createTask(taskData: any): Chainable<void>
      mockSocket(): Chainable<void>
    }
  }
}