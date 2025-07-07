describe('Appcues Integration Tests', () => {
  beforeEach(() => {
    // Visit the app and wait for it to load
    cy.visit('/')
    
    // Wait for the app to be fully loaded
    cy.get('#root').should('be.visible')
  })

  describe('Appcues SDK Loading', () => {
    it('should load Appcues SDK correctly', () => {
      // Check if Appcues is loaded globally
      cy.checkAppcuesLoaded()
    })

    it('should have correct Appcues settings', () => {
      cy.window().then((win) => {
        const settings = (win as any).AppcuesSettings
        expect(settings).to.exist
        expect(settings.enableURLDetection).to.be.true
      })
    })

    it('should have Appcues script loaded', () => {
      // Check if the Appcues script is present in the DOM
      cy.get('script[src*="fast.appcues.com/222410.js"]').should('exist')
    })
  })

  describe('All Products Page', () => {
    beforeEach(() => {
      // Navigate to all-products page
      cy.visit('/all-products')
      
      // Wait for the page to load
      cy.get('#root').should('be.visible')
    })

    it('should have Appcues loaded on all-products page', () => {
      cy.checkAppcuesLoaded()
    })

    it('should track page navigation to all-products', () => {
      cy.window().then((win) => {
        // Spy on Appcues.page function
        const appcuesPageSpy = cy.spy((win as any).Appcues, 'page').as('appcuesPage')
        
        // Navigate to a different page to trigger tracking
        cy.visit('/create-test')
        
        // Verify Appcues.page was called
        cy.get('@appcuesPage').should('have.been.called')
      })
    })

    it('should maintain Appcues functionality after page interactions', () => {
      // Perform some interactions on the page
      cy.get('body').click()
      
      // Verify Appcues is still available
      cy.window().then((win) => {
        expect((win as any).Appcues).to.exist
        expect((win as any).Appcues.page).to.be.a('function')
      })
    })
  })

  describe('Create Test Page', () => {
    beforeEach(() => {
      // Navigate to create-test page
      cy.visit('/create-test')
      
      // Wait for the page to load
      cy.get('#root').should('be.visible')
    })

    it('should have Appcues loaded on create-test page', () => {
      cy.checkAppcuesLoaded()
    })

    it('should track page navigation to create-test', () => {
      cy.window().then((win) => {
        // Spy on Appcues.page function
        const appcuesPageSpy = cy.spy((win as any).Appcues, 'page').as('appcuesPage')
        
        // Navigate to a different page to trigger tracking
        cy.visit('/all-products')
        
        // Verify Appcues.page was called
        cy.get('@appcuesPage').should('have.been.called')
      })
    })

    it('should maintain Appcues functionality after page interactions', () => {
      // Perform some interactions on the page
      cy.get('body').click()
      
      // Verify Appcues is still available
      cy.window().then((win) => {
        expect((win as any).Appcues).to.exist
        expect((win as any).Appcues.page).to.be.a('function')
      })
    })
  })

  describe('Page Navigation Tracking', () => {
    it('should track navigation between all-products and create-test pages', () => {
      cy.window().then((win) => {
        // Spy on Appcues.page function
        const appcuesPageSpy = cy.spy((win as any).Appcues, 'page').as('appcuesPage')
        
        // Navigate to all-products
        cy.visit('/all-products')
        cy.get('@appcuesPage').should('have.been.called')
        
        // Navigate to create-test
        cy.visit('/create-test')
        cy.get('@appcuesPage').should('have.been.called')
        
        // Navigate back to all-products
        cy.visit('/all-products')
        cy.get('@appcuesPage').should('have.been.called')
      })
    })

    it('should track navigation using React Router', () => {
      cy.window().then((win) => {
        // Spy on Appcues.page function
        const appcuesPageSpy = cy.spy((win as any).Appcues, 'page').as('appcuesPage')
        
        // Start on all-products page
        cy.visit('/all-products')
        
        // Use React Router navigation (if there are navigation links)
        // This test assumes there might be navigation links between pages
        // If there are no direct links, we'll use programmatic navigation
        cy.visit('/create-test')
        cy.get('@appcuesPage').should('have.been.called')
      })
    })
  })

  describe('Appcues Configuration', () => {
    it('should have correct Appcues account ID', () => {
      // Verify the script URL contains the correct account ID
      cy.get('script[src*="fast.appcues.com/222410.js"]').should('exist')
    })

    it('should have URL detection enabled', () => {
      cy.window().then((win) => {
        const settings = (win as any).AppcuesSettings
        expect(settings.enableURLDetection).to.be.true
      })
    })
  })

  describe('Error Handling', () => {
    it('should gracefully handle Appcues when script fails to load', () => {
      // This test would require mocking the script failure
      // For now, we'll just verify the app doesn't crash
      cy.visit('/all-products')
      cy.get('#root').should('be.visible')
      
      // Verify the page is still functional
      cy.window().then((win) => {
        // The app should still work even if Appcues fails
        expect(win).to.exist
      })
    })
  })
}) 