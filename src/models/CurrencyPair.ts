import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface CurrencyPairAttributes {
    id: number;
    currencyPair: string;
    exchangeRate: number;
    createdAt: Date;
    updatedAt: Date;
}

interface CurrencyPairCreationAttributes extends Optional<CurrencyPairAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class CurrencyPair extends Model<CurrencyPairAttributes, CurrencyPairCreationAttributes> implements CurrencyPairAttributes {
    public id!: number;
    public currencyPair!: string;
    public exchangeRate!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CurrencyPair.init(
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
        tableName: 'currency_pairs'
    }
);

export default CurrencyPair;
