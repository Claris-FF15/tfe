CREATE TABLE role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

CREATE INDEX idx_role_id ON role(id);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id INTEGER,

    CONSTRAINT fk_user_role
        FOREIGN KEY(role_id)
        REFERENCES role(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_users_role_id 
ON users(role_id);


CREATE TABLE badge (
    id SERIAL PRIMARY KEY,
    uid VARCHAR(50) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,

    CONSTRAINT fk_badge_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_badge_user_id 
ON badge(user_id);

CREATE TABLE zone (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE door (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    zone_id INTEGER,

    CONSTRAINT fk_door_zone
        FOREIGN KEY(zone_id)
        REFERENCES zone(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_door_zone_id
ON door(zone_id);

CREATE TABLE access_permission (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,
    door_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_permission_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_permission_door
        FOREIGN KEY(door_id)
        REFERENCES door(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_user_door_permission
        UNIQUE(user_id, door_id)
);


CREATE INDEX idx_permission_user_id
ON access_permission(user_id);


CREATE INDEX idx_permission_door_id
ON access_permission(door_id);

CREATE TABLE access_log (

    id BIGSERIAL PRIMARY KEY,

    badge_id INTEGER,
    user_id INTEGER,
    door_id INTEGER,

    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    allowed BOOLEAN,

    reason TEXT,


    CONSTRAINT fk_access_log_badge
        FOREIGN KEY(badge_id)
        REFERENCES badge(id)
        ON DELETE SET NULL,


    CONSTRAINT fk_access_log_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE SET NULL,


    CONSTRAINT fk_access_log_door
        FOREIGN KEY(door_id)
        REFERENCES door(id)
        ON DELETE SET NULL
);


CREATE INDEX idx_access_log_badge_id
ON access_log(badge_id);


CREATE INDEX idx_access_log_user_id
ON access_log(user_id);


CREATE INDEX idx_access_log_door_id
ON access_log(door_id);

