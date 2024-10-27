import { Request, Response } from 'express';
import { createCurrencyPair, getAllCurrencyPairs, getCurrencyPairById, updateCurrencyPair, deleteCurrencyPair } from '../services/currencyPairService';
import CurrencyPair from '../models/CurrencyPair';

export const createPair = async (req: Request, res: Response) => {
    try {
        const newPair = await createCurrencyPair(req.body);
        res.status(201).json(newPair);
    } catch (error) {
        res.status(500).json({ message: 'Error creating currency pair', error });
    }
};

export const getPairs = async (req: Request, res: Response) => {
    try {
        const pairs = await getAllCurrencyPairs();
        res.status(200).json(pairs);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pairs', error });
    }
};

export const getPairById = async (req: Request, res: Response) => {
    try {
        const pair = await getCurrencyPairById(Number(req.params.id));
        if (pair) {
            res.status(200).json(pair);
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching currency pair', error });
    }
};

export const updatePair = async (req: Request, res: Response) => {
    try {
        const updatedPair = await updateCurrencyPair(Number(req.params.id), req.body);
        if (updatedPair) {
            res.status(200).json(updatedPair);
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating currency pair', error });
    }
};

export const deletePair = async (req: Request, res: Response) => {
    try {
        const deleted = await deleteCurrencyPair(Number(req.params.id));
        if (deleted) {
            res.status(200).json({ message: 'Currency pair deleted successfully' });
        } else {
            res.status(404).json({ message: 'Currency pair not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting currency pair', error });
    }
};

export const getRecentRates = async (req: Request, res: Response) => {
    const { pair } = req.query;

    try {
        // Find recent 4 rates including current one
        const recentRates = await CurrencyPair.findAll({
            // @ts-ignore
            where: { currencyPair: pair },
            limit: 4,
            order: [['createdAt', 'DESC']]
        });

        if (recentRates.length === 0) {
            return res.status(404).json({ message: 'No rates found for this currency pair' });
        }

        // Format the response
        const currentRate = recentRates[0].exchangeRate;
        const previousRates = recentRates.slice(1).map((rate) => ({
            date: rate.createdAt,
            rate: rate.exchangeRate,
        }));

        res.status(200).json({
            pair,
            rate: currentRate,
            previous: previousRates
        });
    } catch (error: any) {
        // Log and handle any errors
        res.status(500).json({ message: 'Error fetching recent rates', error: error.message });
    }
};
