// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to check if Appcues is loaded
Cypress.Commands.add('checkAppcuesLoaded', () => {
  cy.window().then((win) => {
    // Check if Appcues script is loaded
    expect((win as any).AppcuesSettings).to.exist
    expect((win as any).AppcuesSettings.enableURLDetection).to.be.true
    
    // Check if Appcues object exists
    expect((win as any).Appcues).to.exist
    expect((win as any).Appcues.page).to.be.a('function')
  })
})

// Custom command to check if Appcues page tracking is working
Cypress.Commands.add('checkAppcuesPageTracking', () => {
  cy.window().then((win) => {
    // Spy on the Appcues.page function
    const appcuesPageSpy = cy.spy((win as any).Appcues, 'page').as('appcuesPage')
    
    // Navigate to a different page to trigger page tracking
    cy.visit('/my-tests')
    
    // Check if Appcues.page was called
    cy.get('@appcuesPage').should('have.been.called')
  })
}) 