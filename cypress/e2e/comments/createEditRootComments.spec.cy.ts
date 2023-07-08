import { DISCUSSION_LIST } from "../constants";
import { deleteAll, seedAll } from "../utils";

describe("Basic root comment operations", () => {
  beforeEach(function () {
    deleteAll();
    seedAll();
    cy.loginWithCreateEventButton();
  });

  it("creates, edits and deletes a comment", () => {
    const TEST_COMMENT_TEXT = "Test comment";
    
    // Go to the discussion list
    cy.visit(DISCUSSION_LIST);

    // Click on the first discussion
    cy.get("span").contains("Example topic 1").click();

    // From the preview, go to the discussion detail page
    cy.get("a[data-testid='discussion-permalink']").click();

    // Click the 'write a reply' textarea
    cy.get("textarea[data-testid='addComment']").click();

    // Type a comment
    cy.get("textarea[id='texteditor-textarea']").type(TEST_COMMENT_TEXT);

    // Save the comment
    cy.get("button").contains("Save").click();

    // Check for paragraph with comment text
    cy.get("p").contains(TEST_COMMENT_TEXT);


    
    // Now edit the comment
    cy.contains('[data-testid="comment"]', TEST_COMMENT_TEXT)
      .find('span[data-testid="edit-comment-button"]')
      .click();

    // Type a new comment
    const updatedCommentText = 'This is my updated comment';
    cy.get("textarea[id='texteditor-textarea']").clear().type(updatedCommentText);

   // Save the comment
    cy.get("span").contains("Save").click();
    // Check for paragraph with comment text
    cy.get("p").contains(TEST_COMMENT_TEXT);

    // Now delete the comment
    cy.contains('[data-testid="comment"]', updatedCommentText)
      .find('[data-testid="delete-comment-button"]')
      .click();

      // Confirm deletion
      cy.get("button").contains("Delete").click();

      // Check that the comment is gone
      cy.get("p").contains(updatedCommentText).should("not.exist");

  });
});
