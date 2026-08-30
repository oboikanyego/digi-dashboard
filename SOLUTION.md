# Solution Notes

## Overview

This solution keeps the assignment intentionally small and focused. It uses a single Angular dashboard, a service boundary around `HttpClient`, and an in-app HTTP interceptor that behaves like a local REST API. No separate backend is required because the assignment allows an in-app mock and requires the solution to run offline.

## Architecture

```text
DashboardComponent
  ├─ Signals / computed state
  ├─ Reactive Form + RxJS search stream
  └─ WorkOrderService
       └─ HttpClient
            └─ workOrderMockInterceptor
                 └─ generated in-memory work-order dataset
```

### Component responsibilities

`DashboardComponent` owns presentation and interaction state:

- loaded work orders
- loading and error state
- selected work order
- search text
- status update form
- update feedback
- derived overdue count and filtered dataset

### Service responsibilities

`WorkOrderService` contains the HTTP contract only:

- `GET /api/work-orders`
- `GET /api/work-orders/:id`
- `PUT /api/work-orders/:id`

Keeping HTTP calls behind a service means the component is not coupled to the mock implementation. A real API could replace the interceptor without changing the component contract.

## Signals

Signals are used for synchronous application and UI state:

- `workOrders`
- `loading`
- `error`
- `filterText`
- `selectedWorkOrder`
- update state

`computed()` is used for values that should be derived rather than manually synchronized:

- `filteredWorkOrders`
- `overdueCount`

This avoids maintaining duplicate state such as a separate manually updated overdue counter.

## RxJS

RxJS is used where the input naturally behaves as an event stream. The search `FormControl.valueChanges` stream uses:

- `debounceTime(250)` to avoid reacting to every keystroke immediately
- `distinctUntilChanged()` to ignore repeated values
- `takeUntilDestroyed()` for automatic subscription cleanup

HTTP calls remain Observables through Angular `HttpClient`.

## Table choice

AG Grid Community was chosen because it provides a reliable data-heavy table implementation with sorting, pagination, resizing and efficient row rendering without requiring custom table infrastructure.

The assignment only requires sorting **or** filtering. This implementation provides both a debounced text search and AG Grid sorting while keeping the interaction simple.

## Performance and load considerations

The assignment dataset is approximately 500 rows. Loading the dataset once is reasonable at this size, so I deliberately did not introduce server-side pagination or a more complex state library.

The solution still limits unnecessary work through:

- debounced search input
- computed derived state
- AG Grid pagination (10 / 25 / 50 rows)
- replacing only the updated entity in the Signal after a successful PUT instead of refetching all 500 rows

For significantly larger production datasets, I would move filtering, sorting and pagination to the backend and request only the current page. I would also add request/response telemetry and consider caching based on real usage patterns.

## Status update flow

1. The user selects a work order from the table.
2. The Reactive Form is initialized with its current status.
3. Submitting calls `PUT /api/work-orders/:id`.
4. The mock API simulates latency.
5. On success, only the matching work order is replaced in client state.
6. On failure, the existing table state is preserved and an inline error is displayed without a page reload.

The optional note is kept as UI-only input because persisting it was not required by the brief.

## Failure path

A deterministic failure is easier to demonstrate than random failures. Updating `WO-2026-00013` therefore intentionally returns HTTP 500 after simulated latency.

This allows the reviewer to repeat the error scenario reliably and verify that the UI handles it gracefully.

## Testing

The test scope intentionally matches the assignment rather than aiming for broad coverage.

### Service

The service spec uses Angular HTTP testing utilities to validate:

- successful GET request and response
- HTTP 500 failure propagation

### Standalone component

The dashboard component spec validates the computed overdue metric and confirms that completed work orders are excluded even when their SLA is in the past.

## Trade-offs

### No separate Node.js backend

A backend would add setup and maintenance work without improving the frontend assessment. The in-app interceptor still exercises Angular `HttpClient` and preserves a REST-style boundary while satisfying the offline requirement.

### No NgRx

The state is local to one page and is small enough for Signals and a service. NgRx would add unnecessary abstraction for this scope. I would reconsider centralized state management if multiple features needed to coordinate complex shared state.

### Client-side filtering

At ~500 rows, local filtering is simple and responsive. At much larger scale, I would use server-side filtering and pagination.

### PUT instead of PATCH

The brief allows choosing the local API shape. PUT was used for simplicity because the mock endpoint merges the supplied partial update into the existing entity. In a production API I would align the verb and semantics with the backend contract, likely using PATCH for partial status updates.

## What I would add for production

- real backend persistence and authentication/authorization
- server-side filtering/sorting/pagination for large datasets
- centralized observability and performance telemetry
- accessibility audit and richer keyboard support
- end-to-end tests for the critical update path
- optimistic concurrency/versioning if multiple users can update the same work order

## AI usage

AI was used as an active pair-programming and review tool during the assignment. I used it to understand the brief, validate design choices, review the repository against the acceptance criteria, and help generate/refine parts of the implementation such as the status-update flow, mock failure path, tests and documentation.

Representative prompts/instructions from the working session included:

1. `Please guide me through on how to build this project from start to finish and what are the checkpoints, what are the takeaways as well, and I'm not sure if this application needs backend according to what I was given.`
2. `did i complete the requirements? https://github.com/oboikanyego/digi-dashboard`
3. `add the changes on dev`

I treated the AI output as code-review/pair-programming input rather than as an authority. I reviewed the changes against the assignment requirements, kept the architecture intentionally small, and I am responsible for being able to explain and defend every part of the submitted solution in the technical interview.
