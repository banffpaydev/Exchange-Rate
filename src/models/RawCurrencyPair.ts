import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';
import { CurrencyPairAttributes, CurrencyPairCreationAttributes } from './CurrencyPair';


class RawCurrencyPair extends Model<CurrencyPairAttributes, CurrencyPairCreationAttributes> implements CurrencyPairAttributes {
    public id!: number;
    public currencyPair!: string;
    public exchangeRate!: number;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

RawCurrencyPair.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        currencyPair: {
            type: DataTypes.STRING,
            allowNull: false
        },
        
        exchangeRate: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    },
    {
        sequelize,
        tableName: 'raw_currency_pairs'
    }
);

export default RawCurrencyPair;
