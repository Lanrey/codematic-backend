# YouTube Comments Viewer Backend

This repository contains the backend for the YouTube Comments Viewer application. The backend is built using Node.js, TypeScript, and Fastify, with `tsyringe` for dependency injection, `ioredis` for caching, and Jest for testing. It provides APIs to fetch YouTube video details and comments, with a focus on scalability, efficient caching, and robust error handling.

## Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Setup and Installation](#setup-and-installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [Key Concepts and Components](#key-concepts-and-components)
  - [Scalability and Events](#scalability-and-events)
  - [Rate Limiting with Exponential Backoff](#rate-limiting-with-exponential-backoff)
  - [Redis for Caching](#redis-for-caching)
- [API Endpoints](#api-endpoints)
  - [GET /video-details](#get-video-details)
  - [GET /video-comments](#get-video-comments)
- [Error Handling](#error-handling)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Scalable Architecture**: Uses an event-driven design to handle large volumes of data, such as YouTube comments, effectively.
- **Rate Limiting**: Implements exponential backoff to handle rate limits imposed by external APIs like YouTube's Data API.
- **Caching**: Leverages Redis to cache video details and comments to improve performance and reduce API calls.
- **Type Safety**: Written in TypeScript to ensure type safety across the application.
- **Dependency Injection**: Utilizes `tsyringe` for clean and maintainable dependency injection.
- **Unit Testing**: Comprehensive unit tests using Jest.

## Architecture Overview

The application follows a layered architecture to separate concerns and make the codebase more maintainable and testable. The primary layers include:

- **Controllers**: Handle incoming HTTP requests and delegate the processing to the service layer.
- **Services**: Contain the core business logic, interacting with external APIs, the database, and the cache.
- **Repositories**: Handle interactions with the database.
- **Cache**: Manages data caching using Redis.
- **Events**: Manage asynchronous tasks and processes to scale the application.

## Setup and Installation

### Prerequisites

- Node.js (v14 or later)
- npm or Yarn
- Redis Server

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Lanrey/codematic-backend.git
   cd youtube-comments-viewer-backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory and configure the necessary environment variables as described below.

## Environment Variables

The application uses the following environment variables:

- `YOUTUBE_API_KEY`: Your YouTube Data API key.
- `REDIS_HOST`: The Redis server host.
- `REDIS_PORT`: The Redis server port.
- `REDIS_PASSWORD`: The Redis server password (if applicable).
- `AZURE_SERVICE_BUS_CONNECTION_STRING`: Azure Service Bus connection string for event processing.
- `DB_CLIENT`: postgres client
- `DB_HOST`: The host of the database
- `DB_PORT`: The port of the database
- `DB_NAME`: defaultdb
- `DB_USER`: User name of the database
- `DB_PASSWORD`: Password of the database

Example `.env` file:

```env
YOUTUBE_API_KEY=your_youtube_api_key
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
AZURE_SERVICE_BUS_CONNECTION_STRING=your_azure_service_bus_connection_string
DB_CLIENT=postgres client
DB_HOST=The host of the database
DB_PORT=The port of the database
DB_NAME=defaultdb
DB_USER=User name of the database
DB_PASSWORD=Password of the database
```

## Running the Application

To start the application, use:

```bash
npm run start
```

## Running the migrations

To run the migration, use:
```bash
knex run migrate:latest
```

This will start the Fastify server on the configured port.

## Running Tests

The application includes unit tests written with Jest. To run the tests, use:

```bash
npm test
```

## Key Concepts and Components

### Scalability and Events

The application is designed to handle large volumes of YouTube comments efficiently. This is achieved using an event-driven architecture, where events are used to manage the asynchronous processing of comments. 

#### Azure Service Bus

- **Azure Service Bus** is used to handle event-driven processing, where events are published when new comments are fetched. This decouples the fetching process from other parts of the application, allowing for better scalability.

- **Event Processor**: The event processor listens for events and processes them, such as fetching additional pages of comments. This ensures that the system can handle large datasets without blocking or timing out.

### Rate Limiting with Exponential Backoff

YouTube Data API imposes rate limits, which restrict the number of API calls you can make within a specific timeframe. To handle these limits:

- **Exponential Backoff**: The application implements an exponential backoff strategy when rate limits are encountered. If a request fails due to rate limiting (HTTP 429), the application waits for an increasing amount of time before retrying the request. This approach helps to reduce the likelihood of hitting rate limits while ensuring that requests eventually succeed.

### Redis for Caching

To minimize the number of API requests to YouTube and reduce latency, the application uses Redis for caching:

- **Video Details Caching**: When video details are requested, the application first checks Redis. If the details are cached, they are returned immediately. If not, the details are fetched from the YouTube API, stored in Redis, and then returned.

- **Comments Caching**: Comments are fetched in chunks and cached incrementally in Redis. This prevents unnecessary API calls and allows for faster responses on subsequent requests. The cache is only considered complete when all pages of comments have been fetched.

### Error Handling

The application includes robust error handling:

- **AppError**: A custom error class that is used for application-specific errors. This ensures that meaningful error messages and codes are returned to the client.
- **Global Error Handling**: Any uncaught errors are handled gracefully, returning a standardized error response to the client.

## API Endpoints

### GET /video-details

Fetches the details of a specific YouTube video.

- **Query Parameters:**
  - `videoId` (string): The ID of the YouTube video.

- **Response:**
  - `200 OK`: Success response with video details.
  - `404 Not Found`: If the video is not found.
  - `500 Internal Server Error`: For unexpected errors.

### GET /video-comments

Fetches comments for a specific YouTube video, with pagination support.

- **Query Parameters:**
  - `videoId` (string): The ID of the YouTube video.
  - `perPage` (number): Number of comments per page.
  - `page` (number): The page number to fetch.

- **Response:**
  - `200 OK`: Success response with paginated comments.
  - `404 Not Found`: If no comments are found.
  - `500 Internal Server Error`: For unexpected errors.

## NOTE!!!!!!!

Due to the deployment server used free service (on render), you need to make sure the server isn't inactive, you can do that by pinging the backend server (https://codematic-backend.onrender.com/), till you get a response, this should take about a minute to respond


## Contributing

Contributions are welcome! Please submit a pull request or open an issue to discuss your changes.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

This README provides a comprehensive overview of the backend, including its architecture, setup, and key features like scalability, rate limiting, and caching. It serves as both a user guide and a developer reference for those looking to understand or contribute to the project.