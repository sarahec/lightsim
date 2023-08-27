-- CreateTable
CREATE TABLE "Simulation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sim_id" TEXT NOT NULL,
    "metadata" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "sim_id" INTEGER NOT NULL,
    "sequence" INTEGER NOT NULL,
    "contents" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    CONSTRAINT "Page_sim_id_fkey" FOREIGN KEY ("sim_id") REFERENCES "Simulation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Simulation_sim_id_key" ON "Simulation"("sim_id");
