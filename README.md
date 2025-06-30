# Corporate Task Generator

A full-stack application for managing tasks, built with .NET 8 (backend) and React (frontend).

---

## Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js (LTS)](https://nodejs.org/)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) or [SQLite](https://www.sqlite.org/download.html) (depending on your backend configuration)

---

## 1. Clone the Repository

## 2. Set Up the Database

### Using Entity Framework Core (SQL Server or SQLite)

1. Navigate to the backend project directory (e.g., `CorporateTaskGenerator.Server`):

    ```bash
    cd CorporateTaskGenerator.Server
    ```

2. Create the database and apply migrations:

    ```bash
    dotnet tool install --global dotnet-ef # if not already installed
    dotnet ef database update
    ```

   > **Note:**  
   > - Ensure your `appsettings.json` connection string is set correctly for your environment.
   > - For SQLite, the database file will be created automatically.

---

## 3. Run the Frontend (React App)

1. Open a new terminal and navigate to the client directory:

    ```bash
    cd corporatetaskgenerator.client
    ```

2. Install dependencies:

    ```bash
    npm install

## 4. Using the App

- Register a new user or log in with existing credentials.
- Create, view, and manage tasks.
- The app uses JWT authentication; tokens are stored in local storage and cleared on app close.
