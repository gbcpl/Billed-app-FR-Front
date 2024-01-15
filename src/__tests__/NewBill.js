/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import {localStorageMock} from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES_PATH} from "../constants/routes.js";
import Bills from "../views/BillsUI.js"
import mockStore from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      expect(screen.getAllByText('Type de dépense', 'Nom de la dépense', 'Date', 'Montant TTC', 'TVA', '%', 'Commentaire', 'Justificatif', 'Envoyer')).toBeTruthy()
    })
    test("Then the mail icon in vertical layout should be hightlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
      expect(mailIcon.classList.contains('active-icon')).toBe(true)
    })
    /*describe("When I submit an empty form", () => {
      test("Then I should receive an error", () => {
        const html = NewBillUI()
        document.body.innerHTML = html
        
      })
    })*/
    describe("When I submit a filled form", () => {
      test("Then I should be redirected on Bills page", async () => {
      const onNavigate = jest.fn()
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee'
      }))
      
      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const html = NewBillUI()
      document.body.innerHTML = html

      const inputDate = screen.getByTestId("datepicker")
      const date = new Date()
      console.log(inputDate)
      await waitFor( () => fireEvent.change(inputDate, { target: { value: date } }))
      expect(inputDate.value).toBe(date)
      const inputAmount = screen.getByTestId("amount")
      fireEvent.change(inputAmount, { target: { value: "150" } })
      expect(inputAmount.value).toBe("150")
      const inputPct = screen.getByTestId("pct")
      fireEvent.change(inputPct, { target: { value: "20" } })
      expect(inputPct.value).toBe("20")
      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputFile, { target: { value: "test.png" } })
      expect(inputFile.value).toBe("test.png")

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn((e) => e.preventDefault())

      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(onNavigate).toHaveBeenCalled()
      })
    })
  })
})
