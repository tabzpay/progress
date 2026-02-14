/**
 * Constants tests
 */

import { describe, it, expect } from 'vitest';
import {
    PAYMENT_TERMS,
    LOAN_STATUS,
    CUSTOMER_TYPE,
    CURRENCY_SYMBOLS,
    ROUTES,
} from './constants';

describe('Constants', () => {
    describe('PAYMENT_TERMS', () => {
        it('has all required payment terms', () => {
            expect(PAYMENT_TERMS.DUE_ON_RECEIPT).toBe('Due on Receipt');
            expect(PAYMENT_TERMS.NET_7).toBe('Net 7');
            expect(PAYMENT_TERMS.NET_15).toBe('Net 15');
            expect(PAYMENT_TERMS.NET_30).toBe('Net 30');
            expect(PAYMENT_TERMS.NET_60).toBe('Net 60');
            expect(PAYMENT_TERMS.NET_90).toBe('Net 90');
        });
    });

    describe('LOAN_STATUS', () => {
        it('has all loan statuses', () => {
            expect(LOAN_STATUS.PENDING).toBe('PENDING');
            expect(LOAN_STATUS.ACTIVE).toBe('ACTIVE');
            expect(LOAN_STATUS.PAID).toBe('PAID');
            expect(LOAN_STATUS.OVERDUE).toBe('OVERDUE');
            expect(LOAN_STATUS.DEFAULTED).toBe('DEFAULTED');
            expect(LOAN_STATUS.CANCELLED).toBe('CANCELLED');
        });
    });

    describe('CUSTOMER_TYPE', () => {
        it('has individual and company types', () => {
            expect(CUSTOMER_TYPE.INDIVIDUAL).toBe('individual');
            expect(CUSTOMER_TYPE.COMPANY).toBe('company');
        });
    });

    describe('CURRENCY_SYMBOLS', () => {
        it('maps currency codes to symbols', () => {
            expect(CURRENCY_SYMBOLS.USD).toBe('$');
            expect(CURRENCY_SYMBOLS.EUR).toBe('€');
            expect(CURRENCY_SYMBOLS.GBP).toBe('£');
            expect(CURRENCY_SYMBOLS.NGN).toBe('₦');
        });
    });

    describe('ROUTES', () => {
        it('has static routes', () => {
            expect(ROUTES.HOME).toBe('/');
            expect(ROUTES.DASHBOARD).toBe('/dashboard');
            expect(ROUTES.CUSTOMERS).toBe('/customers');
            expect(ROUTES.CREATE_LOAN).toBe('/create-loan');
        });

        it('has dynamic route functions', () => {
            expect(ROUTES.CUSTOMER_DETAIL('123')).toBe('/customers/123');
            expect(ROUTES.LOAN_DETAIL('456')).toBe('/loan/456');
            expect(ROUTES.GROUP_DETAIL('789')).toBe('/groups/789');
        });
    });
});
