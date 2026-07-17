import { Request, Response } from 'express';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/cliente.dto';

export class ClienteController {
  constructor(private readonly service: ClienteService = new ClienteService()) {}

  create = async (req: Request, res: Response) => {
    // 🔑 Validamos y transformamos el body al DTO esperado
    const dto: CreateClienteDto = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone && req.body.phone.trim() !== "" ? req.body.phone.trim() : null,
    };

    const cliente = await this.service.create(dto);
    res.status(201).json(cliente);
  };

  list = async (req: Request, res: Response) => {
    const result = await this.service.list(req.query as Record<string, string>);
    res.status(200).json({
      items: Array.isArray(result.items) ? result.items : [],
      meta: result.meta,
    });
  };

  getById = async (req: Request, res: Response) => {
    const cliente = await this.service.getById(req.params.id);
    res.status(200).json(cliente);
  };

  update = async (req: Request, res: Response) => {
    const dto: Partial<CreateClienteDto> = {
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone && req.body.phone.trim() !== "" ? req.body.phone.trim() : null,
    };

    const cliente = await this.service.update(req.params.id, dto);
    res.status(200).json(cliente);
  };

  deactivate = async (req: Request, res: Response) => {
    const cliente = await this.service.deactivate(req.params.id);
    res.status(200).json(cliente);
  };
}
