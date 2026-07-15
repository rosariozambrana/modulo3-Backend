import { Request, Response } from 'express';
import { PedidoService } from './pedido.service';
import { CreatePedidoDto, ChangeStatusDto } from './dto/pedido.dto';

export class PedidoController {
  constructor(private readonly service: PedidoService = new PedidoService()) {}

  create = async (req: Request, res: Response) => {
    // 🔑 Transformamos el body al DTO esperado
    const dto: CreatePedidoDto = {
      customerId: req.body.customerId,
      items: req.body.items?.map((it: any) => ({
        productId: it.productId,
        quantity: it.quantity,
      })) ?? [],
    };

    const pedido = await this.service.create(dto);
    res.status(201).json(pedido);
  };

  list = async (req: Request, res: Response) => {
    const result = await this.service.list(req.query as Record<string, string>);
    res.status(200).json({
      items: Array.isArray(result.items) ? result.items : [],
      meta: result.meta,
    });
  };

  getById = async (req: Request, res: Response) => {
    const pedido = await this.service.getById(req.params.id);
    res.status(200).json(pedido);
  };

  changeStatus = async (req: Request, res: Response) => {
    const dto: ChangeStatusDto = {
      status: req.body.status,
    };
    const pedido = await this.service.changeStatus(req.params.id, dto);
    res.status(200).json(pedido);
  };
}
