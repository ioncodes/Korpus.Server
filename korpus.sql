-- creates the needed table in the database korpus
CREATE TABLE devices
(
    device1_secret VARCHAR(255),
    device2_secret VARCHAR(255),
    pair_key VARCHAR(5),
    name1 VARCHAR(255),
    name2 VARCHAR(255) NOT NULL
);
