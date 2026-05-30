import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "drivelegal.db")

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    # Remove existing database file if it exists to clean up old schemas
    if os.path.exists(DB_PATH):
        try:
            os.remove(DB_PATH)
            print("Existing database removed to clean up old table schemas.")
        except Exception as e:
            print(f"Could not remove database file, dropping tables instead: {e}")
            
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # 1. Countries Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS countries (
        country_id TEXT PRIMARY KEY,
        country_code TEXT NOT NULL UNIQUE,
        country_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 2. States / Regions Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS states (
        state_id TEXT PRIMARY KEY,
        country_id TEXT NOT NULL,
        state_code TEXT NOT NULL,
        state_name TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(country_id)
    );
    """)
    
    # 3. Cities Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS cities (
        city_id TEXT PRIMARY KEY,
        state_id TEXT NOT NULL,
        city_name TEXT NOT NULL,
        latitude REAL,
        longitude REAL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (state_id) REFERENCES states(state_id)
    );
    """)
    
    # 4. Traffic Rules Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS traffic_rules (
        rule_id TEXT PRIMARY KEY,
        country_id TEXT NOT NULL,
        state_id TEXT NOT NULL,
        city_id TEXT,
        category TEXT NOT NULL,
        rule_title TEXT NOT NULL,
        rule_description TEXT NOT NULL,
        section_reference TEXT,
        effective_date TEXT,
        source_url TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(country_id),
        FOREIGN KEY (state_id) REFERENCES states(state_id),
        FOREIGN KEY (city_id) REFERENCES cities(city_id)
    );
    """)
    
    # 5. Vehicle Types Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicle_types (
        vehicle_type_id TEXT PRIMARY KEY,
        vehicle_name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 6. Violations Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS violations (
        violation_id TEXT PRIMARY KEY,
        violation_name TEXT NOT NULL,
        category TEXT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)
    
    # 7. Violation Penalties Table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS violation_penalties (
        penalty_id TEXT PRIMARY KEY,
        violation_id TEXT NOT NULL,
        vehicle_type_id TEXT NOT NULL,
        country_id TEXT NOT NULL,
        state_id TEXT NOT NULL,
        city_id TEXT,
        first_offense_fine INTEGER,
        second_offense_fine INTEGER,
        repeat_offense_fine INTEGER,
        imprisonment TEXT,
        license_points INTEGER DEFAULT 0,
        vehicle_seizure INTEGER DEFAULT 0, -- 0 for False, 1 for True
        effective_date TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (violation_id) REFERENCES violations(violation_id),
        FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(vehicle_type_id),
        FOREIGN KEY (country_id) REFERENCES countries(country_id),
        FOREIGN KEY (state_id) REFERENCES states(state_id),
        FOREIGN KEY (city_id) REFERENCES cities(city_id)
    );
    """)
    
    # 8. Challan Calculator Logs
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS challan_calculations (
        calculation_id TEXT PRIMARY KEY,
        vehicle_type_id TEXT NOT NULL,
        violation_id TEXT NOT NULL,
        state_id TEXT NOT NULL,
        city_id TEXT,
        offense_number INTEGER,
        calculated_fine INTEGER,
        calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_type_id) REFERENCES vehicle_types(vehicle_type_id),
        FOREIGN KEY (violation_id) REFERENCES violations(violation_id),
        FOREIGN KEY (state_id) REFERENCES states(state_id),
        FOREIGN KEY (city_id) REFERENCES cities(city_id)
    );
    """)
    
    # 9. AI Chatbot Knowledge Base
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS faq_knowledge (
        faq_id TEXT PRIMARY KEY,
        country_id TEXT NOT NULL,
        state_id TEXT NOT NULL,
        city_id TEXT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        category TEXT,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(country_id),
        FOREIGN KEY (state_id) REFERENCES states(state_id),
        FOREIGN KEY (city_id) REFERENCES cities(city_id)
    );
    """)
    
    # 10. Offline Sync Management
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sync_versions (
        version_id TEXT PRIMARY KEY,
        data_type TEXT NOT NULL,
        version_number TEXT NOT NULL,
        release_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT
    );
    """)
    
    # 11. Government Sources
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS legal_sources (
        source_id TEXT PRIMARY KEY,
        country_id TEXT NOT NULL,
        state_id TEXT NOT NULL,
        source_name TEXT NOT NULL,
        source_url TEXT,
        document_title TEXT,
        publication_date TEXT,
        last_verified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(country_id),
        FOREIGN KEY (state_id) REFERENCES states(state_id)
    );
    """)

    # --- Backward compatibility helper tables ---
    
    # Profile table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profile (
        device_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        safety_score INTEGER DEFAULT 85,
        country TEXT DEFAULT 'IN',
        state_code TEXT DEFAULT 'MH',
        city TEXT DEFAULT 'Mumbai'
    );
    """)

    # Vehicles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        device_id TEXT NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        registration_state TEXT,
        registration_number TEXT,
        FOREIGN KEY (device_id) REFERENCES profile(device_id)
    );
    """)

    # Challans table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS challans (
        id TEXT PRIMARY KEY,
        challan_number TEXT NOT NULL,
        vehicle_number TEXT NOT NULL,
        violation_name TEXT NOT NULL,
        location TEXT NOT NULL,
        amount INTEGER NOT NULL,
        status TEXT NOT NULL,
        issued_at INTEGER NOT NULL,
        deadline_at INTEGER NOT NULL,
        section TEXT NOT NULL,
        act TEXT NOT NULL,
        consequences TEXT NOT NULL
    );
    """)

    # Notifications table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        read INTEGER DEFAULT 0,
        timestamp INTEGER NOT NULL
    );
    """)

    # Sync queue
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        violation_id TEXT NOT NULL,
        state_code TEXT NOT NULL,
        vehicle_type TEXT NOT NULL,
        fine_amount INTEGER NOT NULL,
        timestamp INTEGER NOT NULL
    );
    """)
    
    conn.commit()
    conn.close()
    print("Database tables initialized successfully.")

if __name__ == "__main__":
    init_db()
