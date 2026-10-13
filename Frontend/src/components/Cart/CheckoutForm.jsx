import React from 'react';

export default function CheckoutForm({
    facturacion, setFacturacion,
    medioPago, setMedioPago,
    metodoEntrega, setMetodoEntrega,
    enviandoPedido, onVolver, onSubmit
}) {
    return (
        <div className="border-top pt-4 mt-4 d-flex flex-column gap-4">
            <section className="bg-body-secondary rounded-3 p-3">
                <h2 className="fs-6 fw-semibold border-bottom pb-2 mb-3">Tus datos</h2>
                <div className="mb-3">
                    <label className="form-label">Nombre completo</label>
                    <input
                        type="text"
                        className="form-control rounded-3"
                        value={facturacion.nombreCompleto}
                        onChange={(e) => setFacturacion({ ...facturacion, nombreCompleto: e.target.value })}
                        placeholder="Juan Pérez"
                    />
                </div>
            </section>

            <section className="bg-body-secondary rounded-3 p-3">
                <h2 className="fs-6 fw-semibold border-bottom pb-2 mb-3">Medio de pago</h2>
                <div className="d-flex gap-3">
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="medioPago"
                            id="pagoEfectivo"
                            value="efectivo"
                            checked={medioPago === 'efectivo'}
                            onChange={() => setMedioPago('efectivo')}
                        />
                        <label className="form-check-label" htmlFor="pagoEfectivo">Efectivo</label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="medioPago"
                            id="pagoTransferencia"
                            value="transferencia"
                            checked={medioPago === 'transferencia'}
                            onChange={() => setMedioPago('transferencia')}
                        />
                        <label className="form-check-label" htmlFor="pagoTransferencia">Transferencia bancaria</label>
                    </div>
                </div>
            </section>

            <section className="bg-body-secondary rounded-3 p-3">
                <h2 className="fs-6 fw-semibold border-bottom pb-2 mb-3">Entrega</h2>
                <div className="d-flex gap-3 mb-3">
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="metodoEntrega"
                            id="entregaRetiro"
                            value="retiro"
                            checked={metodoEntrega === 'retiro'}
                            onChange={() => setMetodoEntrega('retiro')}
                        />
                        <label className="form-check-label" htmlFor="entregaRetiro">Retirar en local</label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="metodoEntrega"
                            id="entregaEnvio"
                            value="envio"
                            checked={metodoEntrega === 'envio'}
                            onChange={() => setMetodoEntrega('envio')}
                        />
                        <label className="form-check-label" htmlFor="entregaEnvio">Envío a domicilio</label>
                    </div>
                </div>

                {metodoEntrega === 'envio' && (
                    <div className="mb-3">
                        <label className="form-label">Domicilio</label>
                        <input
                            type="text"
                            className="form-control rounded-3"
                            value={facturacion.domicilio}
                            onChange={(e) => setFacturacion({ ...facturacion, domicilio: e.target.value })}
                            placeholder="Av. Corrientes 1234, CABA"
                        />
                    </div>
                )}
            </section>

            <div className="d-flex justify-content-end gap-2 mt-2">
                <button type="button" className="btn btn-outline-dark" onClick={onVolver}
                    disabled={enviandoPedido}>
                    Volver
                </button>
                <button type="button" className="btn btn-danger fw-bold px-4 shadow-sm" onClick={onSubmit}
                    disabled={enviandoPedido}>
                    {enviandoPedido ? 'Procesando...' : 'Realizar pedido'}
                </button>
            </div>
        </div>
    );
}
