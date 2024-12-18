import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/db";
import { ExchangeRateAttributes, ExchangeRateCreationAttributes } from "./ExchangeRate";


// Define the ExchangeRate model
class RawExchangeRate extends Model<ExchangeRateAttributes, ExchangeRateCreationAttributes> implements ExchangeRateAttributes {
    public id!: string;
    public pair!: string;
    public rates!: Record<string, number | null>;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Initialize the ExchangeRate model
RawExchangeRate.init(
    {
        id: {
            type: DataTypes.INTEGER, // Change to INTEGER
            autoIncrement: true,     // Enable auto increment
            primaryKey: true         // Set as the primary key
        },
        pair: {
            type: DataTypes.STRING,
            allowNull: false,
            //unique: true // Ensure that each currency pair is unique
        },
        rates: {
            type: DataTypes.JSON,
            allowNull: false // Storing exchange rates in JSON format
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: 'raw_exchange_rates', // Specify the table name
    }
);

export default RawExchangeRate;
