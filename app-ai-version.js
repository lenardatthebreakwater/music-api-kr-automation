import axios from "axios"
import { PrismaClient } from "./generated/prisma/index.js"
import dotenv from "dotenv"

dotenv.config()
const prisma = new PrismaClient()

// Configure axios with timeout and retry settings
axios.defaults.timeout = 30000; // 30 second timeout

function log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${level}] ${message}`);
}

async function retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await operation();
        } catch (error) {
            log(`Attempt ${i + 1} failed: ${error.message}`, 'WARN');
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i))); // Exponential backoff
        }
    }
}

async function cleanDatabase() {
    log('Starting database cleanup...');
    try {
        const [melonResult, genieResult, bugsResult] = await Promise.all([
            prisma.melonChart.deleteMany(),
            prisma.genieChart.deleteMany(),
            prisma.bugsChart.deleteMany()
        ]);
        
        log(`Database cleaned - Melon: ${melonResult.count}, Genie: ${genieResult.count}, Bugs: ${bugsResult.count} records deleted`);
    } catch (error) {
        log(`Database cleanup failed: ${error.message}`, 'ERROR');
        throw error;
    }
}

async function getAndSaveMelonChart() {
    log('Fetching Melon chart...');
    try {
        const response = await retryOperation(async () => {
            return await axios.get(process.env.MELON_CHART_API_ENDPOINT);
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response format from Melon API');
        }

        const result = await prisma.melonChart.createMany({
            data: response.data.data,
            skipDuplicates: true,
        });
        
        log(`Melon chart saved: ${result.count} records inserted`);
        return result;
    } catch (error) {
        log(`Melon chart operation failed: ${error.message}`, 'ERROR');
        throw error;
    }
}

async function getAndSaveBugsChart() {
    log('Fetching Bugs chart...');
    try {
        const response = await retryOperation(async () => {
            return await axios.get(process.env.BUGS_CHART_API_ENDPOINT);
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response format from Bugs API');
        }

        const result = await prisma.bugsChart.createMany({
            data: response.data.data,
            skipDuplicates: true,
        });
        
        log(`Bugs chart saved: ${result.count} records inserted`);
        return result;
    } catch (error) {
        log(`Bugs chart operation failed: ${error.message}`, 'ERROR');
        throw error;
    }
}

async function getAndSaveGenieChart() {
    log('Fetching Genie chart...');
    try {
        const response = await retryOperation(async () => {
            return await axios.get(process.env.GENIE_CHART_API_ENDPOINT);
        });

        if (!response.data || !response.data.data) {
            throw new Error('Invalid response format from Genie API');
        }

        const result = await prisma.genieChart.createMany({
            data: response.data.data,
            skipDuplicates: true,
        });
        
        log(`Genie chart saved: ${result.count} records inserted`);
        return result;
    } catch (error) {
        log(`Genie chart operation failed: ${error.message}`, 'ERROR');
        throw error;
    }
}

async function gracefulShutdown() {
    log('Shutting down gracefully...');
    try {
        await prisma.$disconnect();
        log('Database connection closed');
    } catch (error) {
        log(`Error during shutdown: ${error.message}`, 'ERROR');
    }
}

async function main() {
    const startTime = Date.now();
    log('=== Music Chart Scraper Started ===');
    
    try {
        // Clean database first
        await cleanDatabase();
        
        // Fetch all charts in parallel for better performance
        log('Fetching all charts...');
        await Promise.all([
            getAndSaveMelonChart(),
            getAndSaveBugsChart(),
            getAndSaveGenieChart()
        ]);
        
        const duration = (Date.now() - startTime) / 1000;
        log(`=== Music Chart Scraper Completed Successfully in ${duration}s ===`);
        
    } catch (error) {
        log(`=== Music Chart Scraper Failed: ${error.message} ===`, 'ERROR');
        process.exit(1);
    } finally {
        await gracefulShutdown();
    }
}

// Handle process termination signals
process.on('SIGINT', async () => {
    log('Received SIGINT, shutting down...');
    await gracefulShutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    log('Received SIGTERM, shutting down...');
    await gracefulShutdown();
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
    log(`Uncaught Exception: ${error.message}`, 'ERROR');
    await gracefulShutdown();
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, 'ERROR');
    await gracefulShutdown();
    process.exit(1);
});

// Start the application
main();