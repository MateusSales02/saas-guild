import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThan, IsNull } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Event } from './event.entity';

@Injectable()
export class RecurrenceService {
  private readonly logger = new Logger(RecurrenceService.name);

  constructor(
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
  ) {}

  /**
   * Job agendado que roda diariamente às 00:00
   * Cria as próximas ocorrências de eventos recorrentes
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateRecurringEvents() {
    this.logger.log('Iniciando geração de eventos recorrentes...');

    // Busca eventos recorrentes ativos (não deletados)
    const recurringEvents = await this.eventRepo.find({
      where: {
        is_recurring: true,
        deleted_at: IsNull(),
      },
    });

    this.logger.log(
      `Encontrados ${recurringEvents.length} eventos recorrentes`,
    );

    let createdCount = 0;

    for (const event of recurringEvents) {
      try {
        const created = await this.createNextOccurrences(event);
        createdCount += created;
      } catch (error) {
        this.logger.error(
          `Erro ao gerar ocorrências para evento ${event.id}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Geração concluída. ${createdCount} novas ocorrências criadas`,
    );
  }

  /**
   * Cria as próximas ocorrências de um evento recorrente
   * Gera eventos para os próximos 30 dias
   */
  async createNextOccurrences(parentEvent: Event): Promise<number> {
    if (!parentEvent.is_recurring || !parentEvent.recurrence_pattern) {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date(today);
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Verifica se há data final de recorrência
    const endDate = parentEvent.recurrence_end_date
      ? new Date(parentEvent.recurrence_end_date)
      : null;

    if (endDate && endDate < today) {
      this.logger.debug(
        `Evento ${parentEvent.id} já passou da data final de recorrência`,
      );
      return 0;
    }

    // Busca ocorrências já criadas para evitar duplicatas
    const existingOccurrences = await this.eventRepo.find({
      where: {
        parent_event_id: parentEvent.id,
        date: MoreThan(today),
      },
    });

    const existingDates = new Set(
      existingOccurrences.map((e) => e.date.toISOString().split('T')[0]),
    );

    const occurrencesToCreate: Date[] = [];
    let currentDate = new Date(parentEvent.date);

    // Avança para a próxima data se o evento original já passou
    while (currentDate < today) {
      currentDate = this.getNextOccurrenceDate(
        currentDate,
        parentEvent.recurrence_pattern,
        parentEvent.recurrence_interval || 1,
      );
    }

    // Gera datas das próximas ocorrências
    while (currentDate <= thirtyDaysFromNow) {
      // Para se passou da data final
      if (endDate && currentDate > endDate) {
        break;
      }

      const dateKey = currentDate.toISOString().split('T')[0];

      // Só adiciona se não existir ocorrência nessa data
      if (!existingDates.has(dateKey)) {
        occurrencesToCreate.push(new Date(currentDate));
      }

      currentDate = this.getNextOccurrenceDate(
        currentDate,
        parentEvent.recurrence_pattern,
        parentEvent.recurrence_interval || 1,
      );
    }

    // Cria as novas ocorrências
    const newEvents: Event[] = [];
    for (const occurrenceDate of occurrencesToCreate) {
      const newEvent = this.eventRepo.create({
        title: parentEvent.title,
        description: parentEvent.description,
        date: occurrenceDate,
        type: parentEvent.type,
        location: parentEvent.location,
        guild: parentEvent.guild,
        is_recurring: false, // Ocorrências não são recorrentes
        parent_event_id: parentEvent.id,
      });

      newEvents.push(newEvent);
    }

    if (newEvents.length > 0) {
      await this.eventRepo.save(newEvents);
      this.logger.debug(
        `Criadas ${newEvents.length} ocorrências para evento ${parentEvent.id}`,
      );
    }

    return newEvents.length;
  }

  /**
   * Calcula a próxima data de ocorrência baseada no padrão
   */
  private getNextOccurrenceDate(
    currentDate: Date,
    pattern: string,
    interval: number,
  ): Date {
    const nextDate = new Date(currentDate);

    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + interval);
        break;

      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7 * interval);
        break;

      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + interval);
        break;

      default:
        // Padrão: semanal
        nextDate.setDate(nextDate.getDate() + 7 * interval);
    }

    return nextDate;
  }

  /**
   * Deleta todas as ocorrências futuras de um evento recorrente
   */
  async deleteFutureOccurrences(parentEventId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.eventRepo.softDelete({
      parent_event_id: parentEventId,
      date: MoreThan(today),
    });

    const deletedCount = result.affected || 0;
    this.logger.log(
      `Deletadas ${deletedCount} ocorrências futuras do evento ${parentEventId}`,
    );

    return deletedCount;
  }

  /**
   * Atualiza todas as ocorrências futuras de um evento recorrente
   */
  async updateFutureOccurrences(
    parentEventId: number,
    updates: Partial<Event>,
  ): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Remove campos que não devem ser atualizados em ocorrências
    const { id, date, is_recurring, recurrence_pattern, ...safeUpdates } =
      updates as any;

    const result = await this.eventRepo.update(
      {
        parent_event_id: parentEventId,
        date: MoreThan(today),
      },
      safeUpdates,
    );

    const updatedCount = result.affected || 0;
    this.logger.log(
      `Atualizadas ${updatedCount} ocorrências futuras do evento ${parentEventId}`,
    );

    return updatedCount;
  }
}
