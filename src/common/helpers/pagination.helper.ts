import { PaginationMetaDto } from '../dto/pagination.dto';

export class PaginationHelper {
    static getPaginationOptions<T extends { page?: number; limit?: number; favoriteExercises?:boolean }>(query: T) {
        const page = query.page || 1;
        const limit = query.limit || 10;
        const skip = (page - 1) * limit;
        const take = limit;
        const favorite = query.favoriteExercises || false;

        return {
            ...query,
            skip,
            take,
            page,
            limit,
            favorite,
        };
    }
    

    static createMeta(page: number, limit: number, total: number, favorite?:boolean): PaginationMetaDto {
        return {
            currentPage: page,
            itemsPerPage:limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
            favoriteExercises: favorite
            
        };
    }
} 