-- site list
CREATE TABLE IF NOT EXISTS sites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) UNIQUE,
    is_default BOOLEAN
);

CREATE TABLE IF NOT EXISTS visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visit_date CHAR(10),
    site_name VARCHAR(50),
    visit_portion NUMERIC
);

CREATE INDEX IF NOT EXISTS site_visit_idx ON visits (
    visit_date, site_name
);