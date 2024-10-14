// import { DataSource } from "typeorm";

// export const AppDataSource = new DataSource({
//   type: "mysql",
//   host: "localhost",
//   port: 3306,
//   username: "root",
//   password: "your_password",
//   database: "exchange_rates",
//   entities: [__dirname + "/../models/*.ts"],
//   synchronize: true,
// });


import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME as string,
//   process.env.DB_USER as string,
//   process.env.DB_PASSWORD as string,
//   {
//     host: process.env.DB_HOST,
//     dialect: 'mysql',
//     port:3306,
//     logging: false,
//   }
// );

const sequelize = new Sequelize(
  process.env.DB_NAME || 'bpay_core',
  process.env.DB_USER || 'backendapiMt1',
  process.env.DB_PASSWORD || 'm80meCoreMKsaGH90',
  {
    host: process.env.DB_HOST || 'bpaybackend.chqkma826ygl.eu-west-2.rds.amazonaws.com',
    dialect: 'postgres',
    port: Number(process.env.DB_PORT) || 5432,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false, // Only use SSL in production
    },
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Database connected...');
  })
  .catch(err => {
    console.log('Error: ' + err);
  });



  sequelize.sync({ alter: true })  // You can use { force: true } to drop tables before recreating them
  .then(() => {
    console.log('Tables created or synchronized...');
  })
  .catch(err => {
    console.log('Error: ' + err);
  });

export default sequelize;

