import { PaginationMetaDto } from '../dto/pagination.dto';

export interface PaginationOptions {
    page?: number;
    limit?: number;
}

export class PaginationHelper {
    static getPaginationOptions(options: PaginationOptions) {
        const page = Math.max(1, options.page || 1);
        const limit = Math.min(100, Math.max(1, options.limit || 10));
        const skip = (page - 1) * limit;

        return {
            skip,
            take: limit,
            page,
            limit
        };
    }

    static createMeta(
        page: number,
        limit: number,
        total: number
    ): PaginationMetaDto {
        return {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit)
        };
    }
} 