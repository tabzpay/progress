/**
 * Customer type utilities tests
 */

import { describe, it, expect } from 'vitest';
import {
    getCustomerDisplayName,
    getCreditUtilization,
    getAvailableCredit,
} from './customer';
import type { Customer } from './customer';

describe('Customer utilities', () => {
    describe('getCustomerDisplayName', () => {
        it('returns company name for company customers', () => {
            const customer = {
                customer_type: 'company',
                company_name: 'ACME Inc',
            } as Customer;

            expect(getCustomerDisplayName(customer)).toBe('ACME Inc');
        });

        it('returns full name for individual customers', () => {
            const customer = {
                customer_type: 'individual',
                first_name: 'John',
                last_name: 'Doe',
            } as Customer;

            expect(getCustomerDisplayName(customer)).toBe('John Doe');
        });

        it('handles missing company name', () => {
            const customer = {
                customer_type: 'company',
            } as Customer;

            expect(getCustomerDisplayName(customer)).toBe('Unnamed Company');
        });

        it('handles missing individual names', () => {
            const customer = {
                customer_type: 'individual',
            } as Customer;

            expect(getCustomerDisplayName(customer)).toBe('Unnamed Customer');
        });
    });

    describe('getCreditUtilization', () => {
        it('calculates utilization percentage correctly', () => {
            const customer = {
                credit_limit: 10000,
                outstanding_balance: 2500,
            } as Customer;

            const result = getCreditUtilization(customer);

            expect(result).toBe(25);
        });

        it('handles zero credit limit', () => {
            const customer = {
                credit_limit: 0,
                outstanding_balance: 0,
            } as Customer;

            const result = getCreditUtilization(customer);

            expect(result).toBe(0);
        });

        it('calculates over 100% utilization', () => {
            const customer = {
                credit_limit: 1000,
                outstanding_balance: 1500,
            } as Customer;

            const result = getCreditUtilization(customer);

            expect(result).toBe(150);
        });
    });

    describe('getAvailableCredit', () => {
        it('calculates available credit correctly', () => {
            const customer = {
                credit_limit: 10000,
                outstanding_balance: 2500,
            } as Customer;

            const result = getAvailableCredit(customer);

            expect(result).toBe(7500);
        });

        it('returns 0 when over limit', () => {
            const customer = {
                credit_limit: 1000,
                outstanding_balance: 1500,
            } as Customer;

            const result = getAvailableCredit(customer);

            expect(result).toBe(0);
        });

        it('handles zero credit limit', () => {
            const customer = {
                credit_limit: 0,
                outstanding_balance: 0,
            } as Customer;

            const result = getAvailableCredit(customer);

            expect(result).toBe(0);
        });
    });
});
