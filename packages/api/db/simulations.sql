
-- SQLite

--  Copyright 2023 Sarah Clark

--  Licensed under the Apache License, Version 2.0 (the "License");
--  you may not use this file except in compliance with the License.
--  You may obtain a copy of the License at

--       https://www.apache.org/licenses/LICENSE-2.0

--  Unless required by applicable law or agreed to in writing, software
--  distributed under the License is distributed on an "AS IS" BASIS,
--  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
--  See the License for the specific language governing permissions and
--  limitations under the License.
 

CREATE DATABASE Lightsim;

CREATE TABLE Simulation (
    id TEXT PRIMARY KEY NOT NULL,
    -- name TEXT NOT NULL,
    -- description TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Page {
    simulation_id TEXT FOREIGN KEY REFERENCES Simulations(id),
    sequence INTEGER NOT NULL,
    contents TEXT NOT NULL,
    metadata TEXT NOT NULL,
    format TEXT NOT NULL
};
