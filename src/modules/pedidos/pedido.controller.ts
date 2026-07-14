import { Request, Response } from 'express';
import { PedidoService } from './pedido.service';

export class PedidoController {
  constructor(private readonly service: PedidoService = new PedidoService()) {}

  create = async (req: Request, res: Response) => {
    const pedido = await this.service.create(req.body);
    res.status(201).json(pedido);
  };

  list = async (req: Request, res: Response) => {
    const result = await this.service.list(req.query as Record<string, string>);
    res.status(200).json(result);
  };

  getById = async (req: Request, res: Response) => {
    const pedido = await this.service.getById(req.params.id);
    res.status(200).json(pedido);
  };

  changeStatus = async (req: Request, res: Response) => {
    const pedido = await this.service.changeStatus(req.params.id, req.body);
    res.status(200).json(pedido);
  };
}
