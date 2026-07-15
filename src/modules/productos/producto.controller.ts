import { Request, Response } from 'express';
import { ProductoService } from './producto.service';

export class ProductoController {
  constructor(private readonly service: ProductoService = new ProductoService()) {}

  create = async (req: Request, res: Response) => {
    const producto = await this.service.create(req.body);
    res.status(201).json(producto);
  };

  list = async (req: Request, res: Response) => {
    const result = await this.service.list(req.query as Record<string, string>);

    // 🔑 Aseguramos que items sea siempre un array
    res.status(200).json({
      items: Array.isArray(result.items) ? result.items : [],
      meta: result.meta,
    });
  };

  getById = async (req: Request, res: Response) => {
    const producto = await this.service.getById(req.params.id);
    res.status(200).json(producto);
  };

  update = async (req: Request, res: Response) => {
    const producto = await this.service.update(req.params.id, req.body);
    res.status(200).json(producto);
  };

  updatePrecioStock = async (req: Request, res: Response) => {
    const producto = await this.service.updatePrecioStock(req.params.id, req.body);
    res.status(200).json(producto);
  };

  deactivate = async (req: Request, res: Response) => {
    const producto = await this.service.deactivate(req.params.id);
    res.status(200).json(producto);
  };
}
