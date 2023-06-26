import './commands';

declare global {
    namespace Cypress {
      interface Chainable {
        loginProgrammatically(): Chainable<Element>;
        loginWithCreateEventButton(): Chainable<Element>;
        seedEvent(): Chainable<Element>;
        deleteEvents(): Chainable<Element>;
      }
    }
  }
  