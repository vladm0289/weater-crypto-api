# Project Name: Test task API

## Description

This project provides an API for managing users with various roles (admin and user). It includes authentication features like user registration, login, and profile retrieval. Additionally, the API integrates with external services for weather and cryptocurrency data.

## Setup Instructions

### 1. Clone the Repository

Clone the repository and navigate to the project folder:

```bash
git clone https://github.com/vladm0289/weater-crypto-api.git
cd weater-crypto-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup the database

You have two options for setting up the database:

Option 1: Use Docker to Set Up the Database
The project uses PostgreSQL with Docker for database management.

Start the database using Docker:

```bash
docker-compose up -d
```

This will start the PostgreSQL database in a Docker container. The database will be available at localhost:5432 with the following default credentials:

- **Username:** user
- **Password:** password
- **Database:** spinanda

Option 2: Use Your Own Database
If you prefer to use your own PostgreSQL database, ensure the following:

Create a PostgreSQL database.

Install the uuid-ossp extension by running the following SQL query:

```bash
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

You can run this query manually via a PostgreSQL client or automate it by running the provided in the root of the project init.sql script:

```bash
psql -U your_user -d your_database -f init.sql
```

Make sure to replace your_user and your_database with the actual PostgreSQL username and database name.

### 4. Configure Environment Variables

Create a `.env` file in the root of the project with required environment variables, example you can check in the root of the project in file .env.example

### 5. Run Prisma Migrations

Once the database is set up, you need to run Prisma migrations to create the database schema.

```bash
npx prisma migrate deploy
```

This command will apply the migrations to the database.

### 6. Run the Application

```bash
npm run dev
```

The application will run on http://localhost:3001.

### API Documentation

You can access the API documentation via Swagger UI at the following URL:

```bash
http://localhost:3001/api-docs
```

### Testing

To run tests with Jest, use the following command:

```bash
npm run test
```

To run tests with coverage, use the following command:

```bash
npm run test:cov
```
