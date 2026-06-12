# Employee Payroll Management

A simple Node.js payroll management app built with Express, EJS, and file-based JSON storage. It supports employee CRUD operations, salary slip generation, search, and payroll summaries.

## Features

- Dashboard showing all employees
- Add, edit, delete employee records
- Search employees by name, department, or ID
- Generate salary slips with calculated HRA, DA, PF, and net pay
- Persistent storage using `employee.json`
- Responsive views rendered with EJS

## Tech Stack

- Node.js
- Express
- EJS
- CORS
- Nodemon (development)

## Getting Started

### Prerequisites

- Node.js installed

### Install dependencies

```bash
npm install
```

### Run the app

```bash
npm run dev
```

The app starts on:

```text
http://localhost:3000
```

## App Routes

### UI Pages

- `GET /` - Dashboard with employee list and statistics
- `GET /search?q=...` - Search filter for dashboard
- `GET /add` - Add employee form
- `POST /add` - Create new employee
- `GET /edit/:id` - Edit employee form
- `POST /edit/:id` - Update employee data
- `GET /delete/:id` - Delete employee
- `GET /slip/:id` - Generate salary slip

### API Endpoints

- `GET /employees` - Return all employee records as JSON
- `POST /employees` - Add a new employee via JSON
- `PUT /employees/:id` - Update employee via JSON
- `DELETE /employees/:id` - Delete employee via JSON

## Data Storage

Employee data is stored in the project root file:

- `employee.json`

This file is read and written directly by the server.

## Project Structure

- `server.js` - Main Express application
- `modules/fileHandler.js` - Salary calculation and data helpers
- `views/` - EJS templates
- `public/` - Static assets (CSS)
- `employee.json` - Local employee data store

## Notes

- Salary calculations use `basicSalary` and compute HRA, DA, PF, and net salary.
- Validation ensures every employee has a name, department, and valid positive salary.

## License

This project is released under the ISC License.
