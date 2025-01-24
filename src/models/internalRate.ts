import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from "../config/db";

export interface InternalRateAttributes {
    id?: number;
    pair: string;
    buy_rate: number;
    sell_rate: number;
    buy_rate_source: number;
    sell_rate_source: number;
    bpay_buy_adder: number;
    bpay_sell_reduct: number;
    buy_exchanges_considered?: Record<string, number | null>;
    sell_exchanges_considered?: Record<string, number | null>;

}

interface CountryCreationAttributes extends Optional<InternalRateAttributes, 'id'> { }

class InternalRate
    extends Model<InternalRateAttributes, CountryCreationAttributes>
    implements InternalRateAttributes {
    public id!: number;
    public pair!: string;
    public buy_rate!: number;
    public sell_rate!: number;
    public buy_rate_source!: number;
    public sell_rate_source!: number;
    public bpay_buy_adder!: number;
    public bpay_sell_reduct!: number;
    public buy_exchanges_considered?: Record<string, number | null>;
    public sell_exchanges_considered!: Record<string, number | null>;
}

InternalRate.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        pair: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        buy_rate: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        sell_rate: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        buy_rate_source: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        sell_rate_source: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        bpay_buy_adder: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        bpay_sell_reduct: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        buy_exchanges_considered: {
            type: DataTypes.JSON,
            allowNull: true 
        },
        sell_exchanges_considered: {
            type: DataTypes.JSON,
            allowNull: false 
        },
    },
    {
        sequelize,
        tableName: 'internal_rates',
        timestamps: false,
    }
);

export default InternalRate;
