const ClickHouse = require('@apla/clickhouse');
require("dotenv").config();

const ch = new ClickHouse({
    host: process.env.CLICKHOUSE_HOST,
    port: process.env.CLICKHOUSE_PORT,
    user: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
    dataObjects: true,
    readonly: false,
    queryOptions: {
        profile: "default",
        database: process.env.CLICKHOUSE_DATABASE,
    },
});

module.exports = ch ;