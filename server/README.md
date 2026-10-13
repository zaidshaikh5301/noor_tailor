# Noor Tailor server (planned)

The server is intentionally unimplemented. When backend work is approved, this folder will hold the Node.js and Express application in the MERN-ready repository.

## Planned architecture

- Express application with versioned REST endpoints.
- MongoDB persistence through Mongoose models.
- Validation, centralized error handling, request logging, and environment-based configuration.
- Product, collection, inventory, order, appointment, customer, and content modules.
- Authentication and payment integrations only after the business requirements and providers are confirmed.

The current storefront uses local mock data and makes no API requests. Its promise-based service layer under `client/src/services` is the sole future integration boundary.
