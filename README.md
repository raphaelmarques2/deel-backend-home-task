# DEEL BACKEND TASK

> ⚠️⚠️ **Notes about changes on the project is at the end of this page!!!** ⚠️⚠️

💫 Welcome! 🎉

This backend exercise involves building a Node.js/Express.js app that will serve a REST API. We imagine you should spend around 3 hours at implement this feature.

## Data Models

> **All models are defined in src/model.js**

### Profile

A profile can be either a `client` or a `contractor`.
clients create contracts with contractors. contractor does jobs for clients and get paid.
Each profile has a balance property.

### Contract

A contract between and client and a contractor.
Contracts have 3 statuses, `new`, `in_progress`, `terminated`. contracts are considered active only when in status `in_progress`
Contracts group jobs within them.

### Job

contractor get paid for jobs by clients under a certain contract.

## Getting Set Up

The exercise requires [Node.js](https://nodejs.org/en/) to be installed. We recommend using the LTS version.

1. Start by cloning this repository.

1. In the repo root directory, run `npm install` to gather all dependencies.

1. Next, `npm run seed` will seed the local SQLite database. **Warning: This will drop the database if it exists**. The database lives in a local file `database.sqlite3`.

1. Then run `npm start` which should start both the server and the React client.

❗️ **Make sure you commit all changes to the master branch!**

## Technical Notes

- The server is running with [nodemon](https://nodemon.io/) which will automatically restart for you when you modify and save a file.

- The database provider is SQLite, which will store data in a file local to your repository called `database.sqlite3`. The ORM [Sequelize](http://docs.sequelizejs.com/) is on top of it. You should only have to interact with Sequelize - **please spend some time reading sequelize documentation before starting the exercise.**

- To authenticate users use the `getProfile` middleware that is located under src/middleware/getProfile.js. users are authenticated by passing `profile_id` in the request header. after a user is authenticated his profile will be available under `req.profile`. make sure only users that are on the contract can access their contracts.
- The server is running on port 3001.

## APIs To Implement

Below is a list of the required API's for the application.

1. **_GET_** `/contracts/:id` - This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!

1. **_GET_** `/contracts` - Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.

1. **_GET_** `/jobs/unpaid` - Get all unpaid jobs for a user (**_either_** a client or contractor), for **_active contracts only_**.

1. **_POST_** `/jobs/:job_id/pay` - Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.

1. **_POST_** `/balances/deposit/:userId` - Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)

1. **_GET_** `/admin/best-profession?start=<date>&end=<date>` - Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.

1. **_GET_** `/admin/best-clients?start=<date>&end=<date>&limit=<integer>` - returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.

```
 [
    {
        "id": 1,
        "fullName": "Reece Moyer",
        "paid" : 100.3
    },
    {
        "id": 200,
        "fullName": "Debora Martin",
        "paid" : 99
    },
    {
        "id": 22,
        "fullName": "Debora Martin",
        "paid" : 21
    }
]
```

## Going Above and Beyond the Requirements

Given the time expectations of this exercise, we don't expect anyone to submit anything super fancy, but if you find yourself with extra time, any extra credit item(s) that showcase your unique strengths would be awesome! 🙌

It would be great for example if you'd write some unit test / simple frontend demostrating calls to your fresh APIs.

## Submitting the Assignment

When you have finished the assignment, create a github repository and send us the link.

Thank you and good luck! 🙏

---

## ⚠️⚠️ Notes from José Raphael Teixeira Marques ⚠️⚠️

> After install the dependencies, to run the tests use `npm run test`.

Changes I made in addition to the API:

1. Changed the project do **Typescript** to get more type correctness and better development experience and productivity
1. Splitted the `app.js` routes in separeted files inside `routes` folder for better organization, and a better name explaining what the route does. Every route file ends with `.route.ts` to be easily found.
1. Added **unit tests** using **jest** and **supertest** for each route to verify the requirements. Each test is in the file next to the route file. Ex: `payForJob.route.ts` and `payForJob.route.spec.ts`.
1. Set `logging:false` to hide sequelize logs during tests
1. Splitted `model.js` file in many files for better organization inside the folder `model`. Changed the global `sequelize` variable to a function that connects to the database, giving more control to tests to disconnect from database.
1. Splitted the `seedDb.js` file so I can call from `npm run seed` and from **jest**
1. Disconnected from database on `seedDb` after run it
1. Created an `adminGuard` middleware to protect `/admin` routes. To identify the admin user you need to set `profile_id:999` on the request header.

If I had more time I would do:

1. Mock que database to make the tests faster and with controlled environment.
1. Extract the business logic inside routes to usecases (like Clean Architecture).
1. Reduce the amount of useless data that comes from database on some queries.
1. Add an better error handling system.
1. Add more tests to verify errors and edge cases on each route.
1. Learn more about **Sequelize** to avoid write raw queries for complex `JOINS`.
