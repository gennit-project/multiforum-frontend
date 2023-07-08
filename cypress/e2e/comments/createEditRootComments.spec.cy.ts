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
    const TEST_DESCRIPTION_2 = "Test comment edit";
    const TEST_USERNAME = "alice";
    
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


    // Click the 'edit' button
    cy.get(`span[data-testid='edit-comment-button-${TEST_USERNAME}']`).click();

    // Type a new comment
    cy.get("textarea[id='texteditor-textarea']").type(TEST_DESCRIPTION_2);

    // Save the comment
    cy.get("button").contains("Save").click();

    // Check for paragraph with comment text
    cy.get("p").contains(TEST_DESCRIPTION_2);


   




    // Now edit the comment
    cy.contains('[data-testid="comment"]', TEST_DESCRIPTION_2)
      .siblings('[data-testid="edit-comment-button"]') // Assuming that the edit button is a sibling element of the comment text.
      .click();
    
    const updatedCommentText = 'This is my updated comment';
    cy.get('[data-testid="edit-comment-input"]').type(updatedCommentText);
    cy.get('[data-testid="submit-edited-comment-button"]').click();

    // Now delete the comment
    cy.contains('[data-testid="comment"]', updatedCommentText)
      .siblings('[data-testid="delete-comment-button"]') // Assuming that the delete button is a sibling element of the comment text.
      .click();

  });
});
