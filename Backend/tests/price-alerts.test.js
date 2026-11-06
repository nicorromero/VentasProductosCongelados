describe('price confirmation flags', () => {
    afterEach(() => {
        jest.dontMock('../src/models/product.model');
        jest.dontMock('../src/models/sale.model');
        jest.dontMock('googleapis');
        delete process.env.GOOGLE_SHEET_ID;
        delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        delete process.env.GOOGLE_PRIVATE_KEY;
    });

    test('clears the pending flag when an admin confirms a suggested price', async () => {
        jest.resetModules();
        const product = {
            price: 100,
            suggestedPrice: 125,
            suggestedPriceDate: new Date(),
            needsPriceConfirmation: true,
            save: jest.fn()
        };
        jest.doMock('../src/models/product.model', () => ({
            findById: jest.fn().mockResolvedValue(product)
        }));

        const { confirmSuggestedPrice } = require('../src/controllers/products.controllers');
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await confirmSuggestedPrice({ params: { id: 'product-1' } }, res);

        expect(product.price).toBe(125);
        expect(product.suggestedPrice).toBeNull();
        expect(product.suggestedPriceDate).toBeNull();
        expect(product.needsPriceConfirmation).toBe(false);
        expect(product.save).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });

    test('clears a stale pending flag when the sheet price matches the current price', async () => {
        jest.resetModules();
        process.env.GOOGLE_SHEET_ID = 'sheet-id';
        process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = 'sync@example.com';
        process.env.GOOGLE_PRIVATE_KEY = 'private-key';

        const product = {
            name: 'Producto',
            price: 100,
            suggestedPrice: 125,
            suggestedPriceDate: new Date(),
            needsPriceConfirmation: true,
            save: jest.fn()
        };
        const sheetRow = ['Producto', 100, '', '', '', '', '', '', '', '', '', '', 100];

        jest.doMock('../src/models/product.model', () => ({
            find: jest.fn().mockResolvedValue([product])
        }));
        jest.doMock('../src/models/sale.model', () => ({}));
        jest.doMock('googleapis', () => ({
            google: {
                auth: { JWT: jest.fn() },
                sheets: jest.fn(() => ({
                    spreadsheets: {
                        values: {
                            get: jest.fn().mockResolvedValue({ data: { values: [sheetRow] } })
                        }
                    }
                }))
            }
        }));

        const { leerPreciosSugeridos } = require('../src/services/excelSync.service');
        await leerPreciosSugeridos();

        expect(product.suggestedPrice).toBeNull();
        expect(product.suggestedPriceDate).toBeNull();
        expect(product.needsPriceConfirmation).toBe(false);
        expect(product.save).toHaveBeenCalled();
    });
});
