describe('createOrder', () => {
    let createOrder;
    let Product;
    let Sales;
    let stock;
    let productReadStock;
    let session;

    beforeEach(() => {
        jest.resetModules();
        stock = 5;
        productReadStock = 5;

        session = {
            withTransaction: jest.fn(async callback => {
                const originalStock = stock;
                try {
                    await callback();
                } catch (error) {
                    stock = originalStock;
                    throw error;
                }
            }),
            endSession: jest.fn()
        };

        jest.doMock('mongoose', () => ({
            startSession: jest.fn().mockResolvedValue(session)
        }));
        jest.doMock('../src/models/product.model', () => ({
            findById: jest.fn(() => ({
                session: jest.fn().mockResolvedValue({
                    _id: 'product-1',
                    name: 'Producto',
                    price: 100,
                    stock: productReadStock
                })
            })),
            updateOne: jest.fn(async (filter, update) => {
                if (stock < filter.stock.$gte) {
                    return { modifiedCount: 0 };
                }
                stock += update.$inc.stock;
                return { modifiedCount: 1 };
            })
        }));
        jest.doMock('../src/models/sale.model', () => ({
            create: jest.fn()
        }));

        Product = require('../src/models/product.model');
        Sales = require('../src/models/sale.model');
        ({ createOrder } = require('../src/controllers/sales.controllers'));
    });

    afterEach(() => {
        jest.dontMock('mongoose');
        jest.dontMock('../src/models/product.model');
        jest.dontMock('../src/models/sale.model');
    });

    test('rolls back the stock update when saving the sale fails', async () => {
        Sales.create.mockRejectedValue(new Error('database write failed'));
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await createOrder({
            body: {
                items: [{ product: 'product-1', quantity: 2 }],
                metodoEntrega: 'retiro'
            }
        }, res);

        expect(Product.updateOne).toHaveBeenCalledWith(
            { _id: 'product-1', stock: { $gte: 2 } },
            { $inc: { stock: -2 } },
            { session }
        );
        expect(Sales.create).toHaveBeenCalledWith(
            [expect.objectContaining({ total: 200 })],
            { session }
        );
        expect(stock).toBe(5);
        expect(session.endSession).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('rejects a stale stock read when the conditional decrement finds insufficient stock', async () => {
        stock = 1;
        productReadStock = 5;
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        await createOrder({
            body: {
                items: [{ product: 'product-1', quantity: 2 }],
                metodoEntrega: 'retiro'
            }
        }, res);

        expect(Product.updateOne).toHaveBeenCalledWith(
            { _id: 'product-1', stock: { $gte: 2 } },
            { $inc: { stock: -2 } },
            { session }
        );
        expect(Sales.create).not.toHaveBeenCalled();
        expect(stock).toBe(1);
        expect(res.status).toHaveBeenCalledWith(400);
    });
});
