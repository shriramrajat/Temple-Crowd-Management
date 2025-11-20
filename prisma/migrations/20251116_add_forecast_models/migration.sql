-- CreateTable
CREATE TABLE "crowd_snapshots" (
    "id" TEXT NOT NULL,
    "zoneId" VARCHAR(50) NOT NULL,
    "zoneName" VARCHAR(100) NOT NULL,
    "footfall" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL,
    "timestamp" TIMESTAMPTZ NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "hourOfDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crowd_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_cache" (
    "id" TEXT NOT NULL,
    "zoneId" VARCHAR(50) NOT NULL,
    "predictedTime" TIMESTAMPTZ NOT NULL,
    "predictedValue" INTEGER NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "peak_hour_patterns" (
    "id" TEXT NOT NULL,
    "zoneId" VARCHAR(50) NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startHour" INTEGER NOT NULL,
    "endHour" INTEGER NOT NULL,
    "avgFootfall" DOUBLE PRECISION NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peak_hour_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crowd_snapshots_zoneId_timestamp_idx" ON "crowd_snapshots"("zoneId", "timestamp");

-- CreateIndex
CREATE INDEX "crowd_snapshots_dayOfWeek_hourOfDay_idx" ON "crowd_snapshots"("dayOfWeek", "hourOfDay");

-- CreateIndex
CREATE INDEX "prediction_cache_zoneId_predictedTime_idx" ON "prediction_cache"("zoneId", "predictedTime");

-- CreateIndex
CREATE INDEX "prediction_cache_expiresAt_idx" ON "prediction_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "peak_hour_patterns_zoneId_dayOfWeek_startHour_key" ON "peak_hour_patterns"("zoneId", "dayOfWeek", "startHour");
