# hks-io

hks-io is a full-stack web application designed to streamline the management of receivables and payables. It offers a comprehensive suite of tools for tracking finances, managing customer data, and ensuring secure access to financial information.

## About the Project

This project provides a robust platform for businesses and individuals to manage their financial transactions. With a user-friendly interface and a powerful backend, hks-io simplifies the process of tracking debts, recording payments, and maintaining a clear overview of financial health. The application is designed to be both scalable and secure, making it suitable for a wide range of use cases.

## Features

- **Dashboard:** A comprehensive overview of key financial metrics, including total receivables, total payables, and outstanding balances.
- **Debt Management:** Create, edit, and delete debt records with detailed information such as due dates, amounts, and associated customers.
- **Payment Processing:** Record payments against outstanding debts, with support for partial payments and payment history tracking.
- **Customer Management:** Maintain a centralized database of customer information, including contact details and transaction history.
- **User Authentication:** Secure user authentication with role-based access control, ensuring that users can only access the information and features relevant to their roles.
- **Real-time Notifications:** Receive real-time notifications for important events, such as new payments or overdue debts, via WebSocket integration.
- **Responsive Design:** A responsive user interface that works seamlessly on both desktop and mobile devices.

## Getting Started

To get the project up and running on your local machine, please follow these steps:

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MariaDB

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/hks-io.git
    cd hks-io
    ```
2.  **Install client dependencies:**
    ```bash
    cd client
    npm install
    ```
3.  **Install server dependencies:**
    ```bash
    cd ../server
    npm install
    ```

### Configuration

1.  **Set up the database:**
    - Create a MariaDB database for the application.
    - You will need to create a `.env` file in the `server` directory and add the database connection details.
2.  **Configure environment variables:**
    - In the `server` directory, create a `.env` file and add the following variables:
      ```
      SERVER_PORT=<your_server_port>
      DB_USER=<your_database_user>
      DB_HOST=<your_database_host>
      DB_DATABASE=<your_database_name>
      DB_PASSWORD=<your_database_password>
      DB_PORT=<your_database_port>
      JWT_SECRET=<your_jwt_secret>
      JWT_EXPIRES_IN=<jwt_expiry_in_days>
      JWT_ISSUER=<jwt_issuer>
      JWT_AUDIENCE=<jwt_audience>
      NODE_ENV=<development | production>
      CLIENT_URL=<client_url>
      TCMB_API_KEY=<your_tcmb_evds2_api_key>
      ```

### Running the Application

1.  **Start the backend server:**
    ```bash
    cd server
    npm run dev
    ```
2.  **Start the frontend client:**
    ```bash
    cd ../client
    npm run dev
    ```

## Technologies Used

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **Vite:** A fast build tool and development server for modern web projects.
- **Tailwind CSS:** A utility-first CSS framework for rapid UI development.
- **Shadcn/ui:** A collection of reusable UI components for React.
- **React Router:** A declarative routing library for React.

### Backend

- **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
- **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
- **PostgreSQL:** A powerful, open-source object-relational database system.
- **JWT (JSON Web Tokens):** A compact, URL-safe means of representing claims to be transferred between two parties.
- **WebSocket:** A communication protocol that provides full-duplex communication channels over a single TCP connection.

## Project Structure

The project is organized into a monorepo structure with two main packages: `client` and `server`.

- **`client/`**: The frontend application built with React.
  - **`src/`**: Contains the main source code for the client.
    - **`components/`**: Reusable UI components, including both custom components and components from the Shadcn/ui library.
    - **`contexts/`**: React Context providers for managing global state, such as user authentication and application configuration.
    - **`hooks/`**: Custom React hooks for encapsulating and reusing component logic.
    - **`layout/`**: The main application layout, including pages for different routes.
    - **`lib/`**: Utility functions, API service clients, and type definitions.
- **`server/`**: The backend application built with Node.js and Express.
  - **`src/`**: Contains the main source code for the server.
    - **`controllers/`**: Express route handlers that process incoming requests and send responses.
    - **`services/`**: The business logic of the application, which is called by the controllers.
    - **`lib/`**: Utility functions, middleware, and the database connection pool.

## API Documentation

For detailed information about the API endpoints, please refer to the [API Documentation](API.md).

## License

This project is a closed-source project. All rights are reserved. See the `LICENSE.md` file for more details.
