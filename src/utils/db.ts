import knex from "knex";

const db = knex({
    client: "mysql2",
    connection: {
        host: "mariadb",
        port: 3306,
        user: "root",
        password: "skye",
        database: "tvii-jp",
        charset: "utf8mb4",
    },
});

export default db;
