import loginProgrammatically from "./commandFunctions/loginProgrammatically";
import loginWithButtonClick from "./commandFunctions/loginWithButtonClick";
import seedEvents from "./commandFunctions/seed/seedEvents";
import seedEmails from "./commandFunctions/seed/seedEmails";
import seedUsers from "./commandFunctions/seed/seedUsers";
import seedChannels from "./commandFunctions/seed/seedChannels";
import seedTags from "./commandFunctions/seed/seedTags";
import deleteEvents from "./commandFunctions/delete/deleteEvents";
import deleteEmails from "./commandFunctions/delete/deleteEmails";
import deleteUsers from "./commandFunctions/delete/deleteUsers";
import deleteChannels from "./commandFunctions/delete/deleteChannels";
import deleteTags from "./commandFunctions/delete/deleteTags";

// LOGIN AND AUTH
Cypress.Commands.add("loginWithCreateEventButton", loginWithButtonClick);
Cypress.Commands.add("loginProgrammatically", loginProgrammatically);

// ADDING SEED DATA
Cypress.Commands.add("seedEvents", seedEvents);
Cypress.Commands.add("seedEmails", seedEmails);
Cypress.Commands.add("seedUsers", seedUsers);
Cypress.Commands.add("seedChannels", seedChannels);
Cypress.Commands.add("seedTags", seedTags);

// DELETING SEED DATA
Cypress.Commands.add("deleteEvents", deleteEvents);
Cypress.Commands.add("deleteEmails", deleteEmails);
Cypress.Commands.add("deleteUsers", deleteUsers);
Cypress.Commands.add("deleteChannels", deleteChannels);
Cypress.Commands.add("deleteTags", deleteTags);
