import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parser';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();


//Object.assign( gyakorlatColumnMapping);