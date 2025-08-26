-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "geohash5" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "tags" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyWeatherSnapshot" (
    "propertyId" INTEGER NOT NULL,
    "temperatureC" DOUBLE PRECISION,
    "humidityPct" DOUBLE PRECISION,
    "wmoCode" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyWeatherSnapshot_pkey" PRIMARY KEY ("propertyId")
);

-- CreateIndex
CREATE INDEX "Property_isActive_city_idx" ON "Property"("isActive", "city");

-- CreateIndex
CREATE INDEX "Property_lat_lng_idx" ON "Property"("lat", "lng");

-- CreateIndex
CREATE INDEX "Property_geohash5_idx" ON "Property"("geohash5");

-- CreateIndex
CREATE INDEX "PropertyWeatherSnapshot_temperatureC_idx" ON "PropertyWeatherSnapshot"("temperatureC");

-- CreateIndex
CREATE INDEX "PropertyWeatherSnapshot_humidityPct_idx" ON "PropertyWeatherSnapshot"("humidityPct");

-- CreateIndex
CREATE INDEX "PropertyWeatherSnapshot_wmoCode_idx" ON "PropertyWeatherSnapshot"("wmoCode");

-- CreateIndex
CREATE INDEX "PropertyWeatherSnapshot_temperatureC_humidityPct_wmoCode_idx" ON "PropertyWeatherSnapshot"("temperatureC", "humidityPct", "wmoCode");

-- AddForeignKey
ALTER TABLE "PropertyWeatherSnapshot" ADD CONSTRAINT "PropertyWeatherSnapshot_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
