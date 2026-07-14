import { Request, Response } from 'express';
import { ClienteService } from './cliente.service';

export class ClienteController {
  constructor(private readonly service: ClienteService = new ClienteService()) {}

  create = async (req: Request, res: Response) => {
    const cliente = await this.service.create(req.body);
    res.status(201).json(cliente);
  };

  list = async (req: Request, res: Response) => {
    const result = await this.service.list(req.query as Record<string, string>);
    res.status(200).json(result);
  };

  getById = async (req: Request, res: Response) => {
    const cliente = await this.service.getById(req.params.id);
    res.status(200).json(cliente);
  };

  update = async (req: Request, res: Response) => {
    const cliente = await this.service.update(req.params.id, req.body);
    res.status(200).json(cliente);
  };

  deactivate = async (req: Request, res: Response) => {
    const cliente = await this.service.deactivate(req.params.id);
    res.status(200).json(cliente);
  };
}
