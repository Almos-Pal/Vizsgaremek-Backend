import { PaginationMetaDto } from '../dto/pagination.dto';

export class PaginationHelper {
    static getPaginationOptions(query: { page?: number; limit?: number }) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;

        return {
            skip,
            take: limit,
            page,
            limit
        };
    }

    static createMeta(page: number, limit: number, total: number): PaginationMetaDto {
        return {
            currentPage: page,
            itemsPerPage: limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit)
        };
    }
} 