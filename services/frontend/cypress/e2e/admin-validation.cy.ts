describe('Admin Validation Queue Workflow', () => {
    beforeEach(() => {
      // Mocking local storage to simulate an already logged-in admin state
      cy.window().then((win) => {
        win.localStorage.setItem('auth_token', 'mock-jwt-admin-token');
        win.localStorage.setItem('user_role', 'admin');
        win.localStorage.setItem('user_name', 'Admin Test');
      });
      // Visit the admin page
      cy.visit('/admin');
    });
  
    it('Should load the admin queue and approve an item, removing it from the list', () => {
      // 1. Verify the queue has items initially
      cy.get('[data-cy="admin-queue-list"]').should('exist');
      
      // Store the initial ID we are going to attempt to approve
      let targetItemId;
      
      cy.get('[data-cy="admin-queue-list"] > div').first().within(() => {
        // Assert the item exists and grab the ID
        cy.get('h3').should('be.visible');
        cy.get('span.font-mono').invoke('text').then((idText) => {
          targetItemId = idText;
        });
        
        // Click the approve button
        cy.get('button').contains('APPROUVER').click();
      });
  
      // 2. Assert the item disappears from the DOM
      cy.then(() => {
        // We ensure that the item we clicked is no longer in the list
        cy.get('[data-cy="admin-queue-list"]').should('not.contain.text', targetItemId);
      });
    });
  });
