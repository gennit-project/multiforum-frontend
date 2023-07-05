import './commands';
import { EventCreateInput } from '../../src/__generated__/graphql';

declare global {
    namespace Cypress {
      interface Chainable {
        loginProgrammatically(): Chainable<Element>;
        loginWithCreateEventButton(): Chainable<Element>;
        seedEvents(): Chainable<Element>;
        seedEmails(): Chainable<Element>;
        seedUsers(): Chainable<Element>;
        seedChannels(): Chainable<Element>;
        seedTags(): Chainable<Element>;
        createEvents(events: EventCreateInput[]): Chainable<Element>;
        deleteEvents(): Chainable<Element>;
        deleteEmails(): Chainable<Element>;
        deleteUsers(): Chainable<Element>;
        deleteChannels(): Chainable<Element>;
        deleteTags(): Chainable<Element>;
      }
    }
  }
  