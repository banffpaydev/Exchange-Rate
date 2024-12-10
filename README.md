
# Project Name: ExchangeRate-backend
## Overview
The **ExchangeRate-backend** project is a currency exchange rate application that provides real-time exchange rates for various currencies. It allows users to convert amounts between different currencies and fetches the latest rates from a reliable API. This project is built using [Node.js, Typescript], making it a robust solution for currency conversion needs.


## Table of Contents
- Installation
- Usage
- Project Structure
- Configuration
- API Integration
- Testing
- Contributing
- License
- Contact


## Installation
To set up this project locally, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/banffpaydev/Exchange-Rate.git
    cd Exchange-Rate
    ```
2. Install dependencies:

This project uses npm as the package manager. Run the following command:

    ```bash
    npm install
    ```

3. Run the application:

You can start the application using:

    ```bash
    npm start
    ```
The application will be available at **http://localhost:5006**.


## Usage
Once the application is running, you can use the following features:

- Currency Conversion: Enter an amount and select currencies to convert.
- View Exchange Rates: Display the current exchange rates for selected currencies.

## Project Structure
The project is organized as follows:

``` 
Exchange-Rate (backend branch)/
├── src/                   # Source files
│   ├── controllers/       # Controllers for handling requests
│   ├── models/            # Database models
│   ├── routes/            # API route definitions
│   ├── services/          # API service functions
│   ├── middleware/        # Middleware functions (e.g., authentication)
│   ├── config/            # Configuration files
│   ├── app.ts             # Main application setup
│   └── server.ts          # Server entry point
├── tests/                 # Test files
├── .env                   # Environment variables
├── package.json           # Project metadata and dependencies
└── README.md              # Project documentation
```

## API Endpoints
1. Get All Exchange Rates
- Method: GET
- Endpoint: /api/exchange-rates
- Description: Fetch the latest exchange rates for all currencies.



