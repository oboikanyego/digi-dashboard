# Digi Dashboard

Digi Dashboard is a small Angular work-order dashboard built for a frontend technical assessment. It represents a delivery and governance view for telecommunications infrastructure work orders and focuses on clear state management, responsive table interactions, local REST-style integration, status updates and focused unit testing.

## Features

- Angular 22 and TypeScript
- Approximately 500 programmatically generated work orders
- AG Grid Community for efficient tabular rendering
- Sorting and pagination
- Debounced text search
- Angular Signals for local state
- `computed()` values for derived dashboard data
- RxJS for debounced user input and HTTP flows
- Reactive Forms for single-step status updates
- Local REST-style GET and PUT requests via Angular `HttpClient`
- Simulated network latency
- Deterministic update failure path with graceful UI error handling
- Focused service and standalone component unit tests

## Tech Stack

- Angular 22
- TypeScript
- RxJS
- Angular Signals
- Angular Reactive Forms
- Angular HttpClient
- AG Grid Community
- Vitest through the Angular CLI test runner

## Getting Started

### Prerequisites

Install:

- Node.js 20 or later
- npm 10 or later

### Install dependencies

```bash
npm install
```

### Run the application

```bash
npm start
```

Then open:

```text
http://localhost:4200
```

No separate backend is required. The application uses an in-app Angular HTTP interceptor to simulate the REST API, so the assessment can run locally without an external service.

## Build

```bash
npm run build
```

## Run Unit Tests

```bash
npm test
```

## Application Behaviour

### Work-order dashboard

The dashboard loads approximately 500 work orders and displays them using AG Grid Community. The dataset includes work-order ID, site, region, status, priority, owner, progress and SLA due date.

The grid supports pagination and sorting. A search field allows work orders to be filtered by values such as ID, site, region, status and owner.

### Summary metric

The dashboard displays an overdue-work-order count derived from the loaded data.

A work order is considered overdue when:

- its SLA due date is earlier than the current time, and
- its status is not `Done`.

The value is derived with an Angular `computed()` Signal instead of being stored as duplicated state.

### Status update

Selecting a work order opens a compact Reactive Form that allows its status to be changed.

On submission, the application performs a REST-style update request. When the request succeeds, only the updated work order is replaced in the local Signal state rather than reloading the full dataset.

### Error handling

The mock API includes simulated latency so loading and update states can be observed.

For a repeatable failure scenario, attempting to update:

```text
WO-2026-00013
```

intentionally returns an HTTP 500 response. The application keeps the current page state and displays an inline error without a full-page reload.

## Local API Contract

The REST-style API is implemented by an Angular HTTP interceptor.

### Get all work orders

```http
GET /api/work-orders
```

Returns approximately 500 generated work orders after simulated latency.

### Get a single work order

```http
GET /api/work-orders/:id
```

### Update a work order

```http
PUT /api/work-orders/:id
Content-Type: application/json

{
  "status": "Blocked"
}
```

A successful request returns the updated work order including a refreshed `lastUpdatedAt` timestamp.

## State and Reactivity

Angular Signals are used for synchronous application state such as:

- loaded work orders
- loading state
- errors
- current search value
- selected work order
- update state

Derived values such as the overdue count and filtered work-order list use `computed()`.

RxJS is used where stream-based behaviour is useful, particularly debouncing search input and handling asynchronous HTTP operations.

This keeps the responsibilities clear: Signals represent current UI state, while RxJS handles asynchronous and event-driven behaviour.

## Performance Decisions

The assignment dataset is intentionally modest at around 500 rows. For this scale, loading the dataset once and filtering locally keeps the implementation simple and responsive.

The application still avoids unnecessary UI and network work by using:

- AG Grid pagination
- debounced search input
- computed derived state
- targeted local updates after a successful status change instead of refetching all records

For a substantially larger production dataset, filtering, sorting and pagination would be moved to the backend so that only the required page of data is transferred and rendered.

## Testing

The unit-test scope follows the assessment requirements rather than aiming for broad coverage.

### Service tests

The work-order service tests exercise REST calls using Angular HTTP testing utilities and cover:

- a successful HTTP request
- an HTTP failure path

### Component test

The standalone dashboard component test validates the computed overdue metric using controlled work-order data.

## Project Structure

```text
src/app/
├── components/
│   └── dashboard.component/
├── mock-api/
│   ├── work-order.interceptor.ts
│   └── work-order.mock.ts
├── models/
│   └── workorders.ts
├── services/
│   ├── work-order.service.ts
│   └── work-order.service.spec.ts
├── app.config.ts
└── app.routes.ts
```

## Design Notes

For a deeper explanation of the architecture, trade-offs, performance decisions, testing approach and AI-assisted development process, see [SOLUTION.md](./SOLUTION.md).
