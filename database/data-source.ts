import { ConnectionOptions } from 'typeorm';
 import { config } from 'dotenv';
 import { DataSource, DataSourceOptions } from 'typeorm'

 config();
 export const AppDataSource:DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST_NAME,
  port: +process.env.DB_PORT,
  database: process.env.DB_DATABASE_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  entities: ["dist/**/*.entity{.ts,.js}"],

  migrations:["dist/database/migrations/*{.ts,.js}"], 
  synchronize: true,
  logging: false,
}



// export const AppDataSource:DataSourceOptions={
//   type: 'mysql',
//   host: process.env.DB_HOST_NAME,
//   //port: +process.env.DB_PORT,
//   database: process.env.DB_DATABASE_NAME,
//   username: "root",
//   password: "Rodolph4904@",
//   entities: ["dist/**/*.entity{.ts,.js}"],

//   migrations:["dist/database/migrations/*{.ts,.js}"], 
//   synchronize: true,
//   logging: false,
// }
const databaseSource = new DataSource(AppDataSource);
databaseSource.initialize();
export default databaseSource;