import { PaginationMetaDto } from '../dto/pagination.dto';

export class PaginationHelper {
    static getPaginationOptions<T extends { page?: number; limit?: number }>(query: T) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const take = limit;

        // Return all query parameters along with pagination options
        return {
            ...query,
            skip,
            take,
            page,
            limit,
        };
    }

    static createMeta(page: number, limit: number, total: number): PaginationMetaDto {
        return {
            currentPage: page,
            itemsPerPage:limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit)
        };
    }
} 