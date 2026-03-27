# Changelog

All notable changes to AutoLink Pro are documented here.

## [0.5.0] - 2026-03-27

### Improvements

- Booking: eventlist/calendar view now displays the code under the invoice number in pill form.

## [0.4.0] - 2026-03-18

### Features

- Pricing Bank: manually add new entries without needing to generate a quote or
  invoice
- Pricing Bank: delete entries with a styled toast confirmation showing the
  code, supplier, and category. Hover over the right side of the row to reveal
  trash-can.
- Pricing Bank: code and supplier fields auto-uppercase on input when adding a
  new entry

### Improvements

- Pricing Bank: new entry row extracted into its own component for better
  performance.
- Pricing Bank: toast notifications use brand colors and include a dark-themed
  confirmation dialog with Delete / Cancel actions

---

## [0.3.0] - 2026-03-16

### Features

- Added Quotes which you can create in the quotes page or appointments form
  through the "Generate Quote" button
- Added Pricing Bank for storing reusable service/pricing templates

### Improvements

- Updated role-based access controls for admin and member roles
- Ability to edit values in the pricing bank directly by hovering over the item
  and clicking the pencil edit button

### Bug Fixes

- Fixed service pill display on invoice and quote detail views

---

## [0.2.0] - 2026-02-10

### Features

- Added Statements module with PDF export
- Added Billing module for admin users
- Added Expense tracking

### Improvements

- Removed unnecessary path revalidation to improve navigation performance

### Bug Fixes

- Fixed invoice status not updating after payment
- Fixed customer search returning duplicate results

---

## [0.1.0] - 2026-01-05

### Features

- Initial release
- Dashboard with revenue charts, finance summaries, and event calendar
- Customer and Employee management
- Appointment / Booking system
- Invoice creation and PDF export
- Service management
