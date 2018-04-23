/*
Copyright (C) 2018  Cloudbase Solutions SRL
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.
You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// @flow

describe('Cancel a running replica', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    Cypress.Cookies.preserveOnce('token', 'projectId')
  })

  it('Cancels replica execution', () => {
    cy.server()
    cy.route({ url: '**/executions/detail', method: 'GET' }).as('execution')
    cy.get('div[data-test-id="statusPill-RUNNING"]').eq(0).click()
    cy.wait('@execution')
    cy.get('a').contains('Executions').click()
    cy.get('button').contains('Cancel Execution').click()
    cy.route({ url: '**/actions', method: 'POST' }).as('cancel')
    cy.get('button').contains('Yes').click()
    cy.wait('@cancel')
    cy.get('div[data-test-id="mainStatusPill-ERROR"]', { timeout: 120000 })
  })
})
