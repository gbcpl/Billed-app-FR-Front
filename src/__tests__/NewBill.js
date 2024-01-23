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
import { ROUTES } from "../constants/routes"


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
    describe("When I submit an empty form", () => {
      test("Then I should not be redirected to Bills page", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname })
        }
        Object.defineProperty(window, 'localStorage', { value: localStorageMock })
        window.localStorage.setItem('user', JSON.stringify({
          type: 'employee'
        }))
        const html = NewBillUI()
        document.body.innerHTML = html
    
        const form = screen.getByTestId("form-new-bill")
        form.noValidate = true;
  
        fireEvent.submit(form)
        waitFor(() => {
          expect(onNavigate).not.toHaveBeenCalled();
        });      
      })
    })
    describe("When I submit a filled form", () => {
      test("Then I should be redirected to Bills page", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'employee'
      }))
      const html = NewBillUI()
      document.body.innerHTML = html

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
      
      const inputDate = screen.getByTestId("datepicker")
      const date = new Date()
      const dateString = date.toISOString().split('T')[0];
      await waitFor( () => fireEvent.change(inputDate, { target: { value: dateString } }))
      expect(inputDate.value).toBe(dateString)
      const inputAmount = screen.getByTestId("amount")
      fireEvent.change(inputAmount, { target: { value: "150" } })
      expect(inputAmount.value).toBe("150")
      const inputPct = screen.getByTestId("pct")
      fireEvent.change(inputPct, { target: { value: "20" } })
      expect(inputPct.value).toBe("20")
      const inputFile = screen.getByTestId("file")
      fireEvent.change(inputFile, { target: { value: "" } })
      expect(inputFile.value).toBe("")

      const form = screen.getByTestId("form-new-bill")
      const handleSubmit = jest.fn(newBill.handleSubmit)

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        handleSubmit(e);
      });
      fireEvent.submit(form)
      expect(handleSubmit).toHaveBeenCalled()
      expect(screen.getByText('Mes notes de frais')).toBeTruthy()
      })
    })
    describe("When I upload a valid file", () => {
      test("Then it should be uploaded", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

        const handleChangeFile = jest.fn(newBill.handleChangeFile)

        const mockBills = mockStore.bills()
        const spyCreate = jest.spyOn(mockBills, "create")

        const mockFileUpload = { preventDefault: jest.fn(), target: { value: "https://localhost:3456/images/test.jpg" } };
        const billInfos = {
          email: "a@a",
          fileUrl: "https://localhost:3456/images/test.jpg",
          fileName: "test.jpg"
        }
        const billCreated = await spyCreate(billInfos)

        handleChangeFile(mockFileUpload)

        expect(handleChangeFile).toHaveBeenCalled()
        expect(spyCreate).toHaveBeenCalled()
        expect(billCreated.fileUrl).toBe("https://localhost:3456/images/test.jpg")
      })
    })
    describe("When I upload a file with an invalid extension", () => {
      test("Then an alert with an error message should appear", () => {
        const html = NewBillUI()
        document.body.innerHTML = html

        const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })
        
        const alertSpy = jest.spyOn(window, 'alert');

        const handleChangeFile = jest.fn(newBill.handleChangeFile)

        const mockFileUpload = { preventDefault: jest.fn(), target: { value: 'C:\\fakepath\\test.txt' } };

        handleChangeFile(mockFileUpload)
        
        expect(handleChangeFile).toHaveBeenCalled()
        expect(alertSpy).toHaveBeenCalled()
      })
    })
  })
  // Test POST bill
  describe("When I post a new bill", () => {
    test("Then it adds the bill to mock API POST", async () => {
      localStorage.setItem("user", JSON.stringify({ type: "employee", email: "a@a" }));

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage })

      const updateBill = jest.fn(newBill.updateBill)
      const mockBills = mockStore.bills()
      const spyUpdate = jest.spyOn(mockBills, "update")

      const bill = {
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "accepted",
        "type": "Hôtel et logement",
        "commentAdmin": "ok",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "2004-04-04",
        "amount": 400,
        "email": "a@a",
        "pct": 20
      }
      const billUpdated = await spyUpdate(bill)

      updateBill(bill)

      expect(updateBill).toHaveBeenCalled()
      expect(spyUpdate).toHaveBeenCalled()
      expect(billUpdated.id).toBe("47qAXb6fIm2zOKkLzMro")
    })
  })
})

