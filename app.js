import axios from "axios"
import { PrismaClient } from "./generated/prisma/index.js"
import dotenv from "dotenv"

dotenv.config()
const prisma = new PrismaClient()

async function cleanDatabase() {
    await prisma.melonChart.deleteMany();
    await prisma.genieChart.deleteMany();
    await prisma.bugsChart.deleteMany();
}

async function getAndSaveMelonChart() {
    const response = await axios.get(process.env.MELON_CHART_API_ENDPOINT)

    const result = await prisma.melonChart.createMany({
        data: response.data.data,
        skipDuplicates: true,
    })
}

async function getAndSaveBugsChart() {
    const response = await axios.get(process.env.BUGS_CHART_API_ENDPOINT)

    const result = await prisma.bugsChart.createMany({
        data: response.data.data,
        skipDuplicates: true,
    })
}

async function getAndSaveGenieChart() {
    const response = await axios.get(process.env.GENIE_CHART_API_ENDPOINT)

    const result = await prisma.genieChart.createMany({
        data: response.data.data,
        skipDuplicates: true,
    })
}


async function main() {
    await cleanDatabase()
    await getAndSaveMelonChart()
    await getAndSaveBugsChart()
    await getAndSaveGenieChart()
}

main()