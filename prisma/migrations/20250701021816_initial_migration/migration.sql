-- CreateTable
CREATE TABLE "MelonChart" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "diff" TEXT NOT NULL,
    "diffVal" INTEGER NOT NULL,
    "albumImg" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,

    CONSTRAINT "MelonChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BugsChart" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "diff" TEXT NOT NULL,
    "diffVal" INTEGER NOT NULL,
    "albumImg" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,

    CONSTRAINT "BugsChart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenieChart" (
    "id" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "diff" TEXT NOT NULL,
    "diffVal" INTEGER NOT NULL,
    "albumImg" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,

    CONSTRAINT "GenieChart_pkey" PRIMARY KEY ("id")
);
