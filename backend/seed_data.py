import sqlite3
import os
import time
import hashlib
import uuid
import pypdf
from database import get_db_connection, init_db

# Helper to generate deterministic UUIDs
def gen_uuid(name_seed):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, name_seed))

def extract_pdf_content(pdf_path):
    """
    Extracts text from PDF if file exists.
    """
    if not os.path.exists(pdf_path):
        print(f"Warning: PDF file {pdf_path} not found.")
        return ""
    try:
        reader = pypdf.PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        print(f"Error parsing PDF {pdf_path}: {e}")
        return ""

def seed_database():
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON;")
    
    # Clear existing data
    cursor.execute("DELETE FROM legal_sources;")
    cursor.execute("DELETE FROM sync_versions;")
    cursor.execute("DELETE FROM faq_knowledge;")
    cursor.execute("DELETE FROM challan_calculations;")
    cursor.execute("DELETE FROM violation_penalties;")
    cursor.execute("DELETE FROM violations;")
    cursor.execute("DELETE FROM vehicle_types;")
    cursor.execute("DELETE FROM traffic_rules;")
    cursor.execute("DELETE FROM cities;")
    cursor.execute("DELETE FROM states;")
    cursor.execute("DELETE FROM countries;")
    cursor.execute("DELETE FROM challans;")
    cursor.execute("DELETE FROM notifications;")
    
    print("Database tables cleared. Starting seeding...")
    
    # 1. Countries
    countries = [
        (gen_uuid("country_in"), "IN", "India"),
        (gen_uuid("country_us"), "US", "United States"),
        (gen_uuid("country_uk"), "UK", "United Kingdom")
    ]
    cursor.executemany("""
    INSERT INTO countries (country_id, country_code, country_name) VALUES (?, ?, ?);
    """, countries)
    
    # 2. States
    states = [
        # India states (28)
        (gen_uuid("state_ap"), gen_uuid("country_in"), "AP", "Andhra Pradesh"),
        (gen_uuid("state_ar"), gen_uuid("country_in"), "AR", "Arunachal Pradesh"),
        (gen_uuid("state_as"), gen_uuid("country_in"), "AS", "Assam"),
        (gen_uuid("state_br"), gen_uuid("country_in"), "BR", "Bihar"),
        (gen_uuid("state_cg"), gen_uuid("country_in"), "CG", "Chhattisgarh"),
        (gen_uuid("state_ga"), gen_uuid("country_in"), "GA", "Goa"),
        (gen_uuid("state_gj"), gen_uuid("country_in"), "GJ", "Gujarat"),
        (gen_uuid("state_hr"), gen_uuid("country_in"), "HR", "Haryana"),
        (gen_uuid("state_hp"), gen_uuid("country_in"), "HP", "Himachal Pradesh"),
        (gen_uuid("state_jh"), gen_uuid("country_in"), "JH", "Jharkhand"),
        (gen_uuid("state_ka"), gen_uuid("country_in"), "KA", "Karnataka"),
        (gen_uuid("state_kl"), gen_uuid("country_in"), "KL", "Kerala"),
        (gen_uuid("state_mp"), gen_uuid("country_in"), "MP", "Madhya Pradesh"),
        (gen_uuid("state_mh"), gen_uuid("country_in"), "MH", "Maharashtra"),
        (gen_uuid("state_mn"), gen_uuid("country_in"), "MN", "Manipur"),
        (gen_uuid("state_ml"), gen_uuid("country_in"), "ML", "Meghalaya"),
        (gen_uuid("state_mz"), gen_uuid("country_in"), "MZ", "Mizoram"),
        (gen_uuid("state_nl"), gen_uuid("country_in"), "NL", "Nagaland"),
        (gen_uuid("state_od"), gen_uuid("country_in"), "OD", "Odisha"),
        (gen_uuid("state_pb"), gen_uuid("country_in"), "PB", "Punjab"),
        (gen_uuid("state_rj"), gen_uuid("country_in"), "RJ", "Rajasthan"),
        (gen_uuid("state_sk"), gen_uuid("country_in"), "SK", "Sikkim"),
        (gen_uuid("state_tn"), gen_uuid("country_in"), "TN", "Tamil Nadu"),
        (gen_uuid("state_ts"), gen_uuid("country_in"), "TS", "Telangana"),
        (gen_uuid("state_tr"), gen_uuid("country_in"), "TR", "Tripura"),
        (gen_uuid("state_up"), gen_uuid("country_in"), "UP", "Uttar Pradesh"),
        (gen_uuid("state_uk"), gen_uuid("country_in"), "UK", "Uttarakhand"),
        (gen_uuid("state_wb"), gen_uuid("country_in"), "WB", "West Bengal"),

        # India Union Territories (8)
        (gen_uuid("state_an"), gen_uuid("country_in"), "AN", "Andaman & Nicobar Islands"),
        (gen_uuid("state_ch"), gen_uuid("country_in"), "CH", "Chandigarh"),
        (gen_uuid("state_dd"), gen_uuid("country_in"), "DD", "Dadra & Nagar Haveli and Daman & Diu"),
        (gen_uuid("state_dl"), gen_uuid("country_in"), "DL", "Delhi"),
        (gen_uuid("state_jk"), gen_uuid("country_in"), "JK", "Jammu & Kashmir"),
        (gen_uuid("state_la"), gen_uuid("country_in"), "LA", "Ladakh"),
        (gen_uuid("state_ld"), gen_uuid("country_in"), "LD", "Lakshadweep"),
        (gen_uuid("state_py"), gen_uuid("country_in"), "PY", "Puducherry"),

        # US states
        (gen_uuid("state_ny"), gen_uuid("country_us"), "NY", "New York"),
        (gen_uuid("state_ca"), gen_uuid("country_us"), "CA", "California"),
        # UK states
        (gen_uuid("state_eng"), gen_uuid("country_uk"), "ENG", "England")
    ]
    cursor.executemany("""
    INSERT INTO states (state_id, country_id, state_code, state_name) VALUES (?, ?, ?, ?);
    """, states)
    
    # 3. Cities
    cities = [
        (gen_uuid("city_mumbai"), gen_uuid("state_mh"), "Mumbai", 19.0760, 72.8777),
        (gen_uuid("city_pune"), gen_uuid("state_mh"), "Pune", 18.5204, 73.8567),
        (gen_uuid("city_chennai"), gen_uuid("state_tn"), "Chennai", 13.0827, 80.2707),
        (gen_uuid("city_delhi"), gen_uuid("state_dl"), "New Delhi", 28.6139, 77.2090),
        (gen_uuid("city_bengaluru"), gen_uuid("state_ka"), "Bengaluru", 12.9716, 77.5946),
        (gen_uuid("city_kochi"), gen_uuid("state_kl"), "Kochi", 9.9312, 76.2673),
        (gen_uuid("city_trivandrum"), gen_uuid("state_kl"), "Thiruvananthapuram", 8.5241, 76.9366),
        (gen_uuid("city_hyderabad"), gen_uuid("state_ts"), "Hyderabad", 17.3850, 78.4867),
        (gen_uuid("city_lucknow"), gen_uuid("state_up"), "Lucknow", 26.8467, 80.9462),
        (gen_uuid("city_ahmedabad"), gen_uuid("state_gj"), "Ahmedabad", 23.0225, 72.5714),
        (gen_uuid("city_nyc"), gen_uuid("state_ny"), "New York City", 40.7128, -74.0060),
        (gen_uuid("city_la"), gen_uuid("state_ca"), "Los Angeles", 34.0522, -118.2437),
        (gen_uuid("city_london"), gen_uuid("state_eng"), "London", 51.5074, -0.1278)
    ]
    cursor.executemany("""
    INSERT INTO cities (city_id, state_id, city_name, latitude, longitude) VALUES (?, ?, ?, ?, ?);
    """, cities)
    
    # 4. Vehicle Types
    vehicle_types = [
        ("2w", "Two-Wheeler", "Motorcycles, scooters, and mopeds"),
        ("auto", "Three-Wheeler / Auto", "Auto rickshaws and electric three-wheelers"),
        ("car", "Light Motor Vehicle (LMV)", "Sedans, hatchbacks, SUVs, and personal cars"),
        ("commercial", "Medium Passenger/Goods Vehicle", "Mini-buses, commercial vans, and medium delivery trucks"),
        ("heavy", "Heavy Goods/Passenger Vehicle (HMV)", "Buses, multi-axle freight trucks, and heavy loaders")
    ]
    cursor.executemany("""
    INSERT INTO vehicle_types (vehicle_type_id, vehicle_name, description) VALUES (?, ?, ?);
    """, vehicle_types)
    
    # 5. Violations
    violations_data = [
        ("speeding", "Over-Speeding", "speed", "Exceeding the posted speed limit on roads or highways."),
        ("no-helmet", "No Helmet", "safety", "Riding a two-wheeler without an ISI-certified helmet."),
        ("signal-jumping", "Signal Jumping", "safety", "Jumping a red light or disobeying signal lights."),
        ("no-seatbelt", "No Seatbelt", "safety", "Driving or riding without wearing a seatbelt."),
        ("dui", "Drunk Driving (DUI)", "dui", "Operating a vehicle with Blood Alcohol Concentration exceeding 30 mg/100 ml."),
        ("mobile-phone", "Using Mobile Phone", "safety", "Using a hand-held mobile phone while driving."),
        ("wrong-parking", "Wrong Parking", "parking", "Parking in a no-parking zone or causing obstruction."),
        ("no-insurance", "Driving Without Insurance", "insurance", "Operating a vehicle without third-party insurance."),
        ("no-licence", "Driving Without Licence", "licensing", "Driving without holding a valid driving license."),
        ("no-puc", "No PUC Certificate", "documents", "Operating a vehicle without a valid Pollution Under Control certificate."),
        ("overloading", "Overloading", "vehicle-standards", "Carrying passengers or cargo beyond authorized loading capacity."),
        ("dangerous-driving", "Dangerous Driving", "safety", "Driving in a manner dangerous to public safety (rash/negligent driving)."),
        ("wrong-side", "Driving on Wrong Side", "safety", "Driving opposite to the traffic flow direction."),
        ("no-registration", "No Vehicle Registration", "documents", "Driving an unregistered vehicle on public roads."),
        ("honking-silence-zone", "Unnecessary Honking", "other", "Honking in silence zones near hospitals, schools, or courts.")
    ]
    cursor.executemany("""
    INSERT INTO violations (violation_id, violation_name, category, description) VALUES (?, ?, ?, ?);
    """, violations_data)
    
    # 6. Parse PDF guidance content for rich seeding
    law_data_dir = r"c:\Users\yuvay\codespace\road safety hackathon\law data"
    guide_text = extract_pdf_content(os.path.join(law_data_dir, "India_Traffic_Rules_and_Acts_Guide.pdf"))
    
    # Clean guide text and parse some highlights
    print(f"Parsed Guide PDF length: {len(guide_text)} characters.")
    
    # 7. Traffic Rules Table
    # Seeding general Indian traffic rules from guide
    traffic_rules = [
        (gen_uuid("rule_dl"), gen_uuid("country_in"), gen_uuid("state_dl"), gen_uuid("city_delhi"), "safety", "Compulsory Helmet & Seatbelt", "Drivers must wear safety belts. Two-wheeler riders and pillions must wear helmets.", "Section 129 / 194B", "2019-09-01", "https://delhitrafficpolice.nic.in/"),
        (gen_uuid("rule_mh"), gen_uuid("country_in"), gen_uuid("state_mh"), gen_uuid("city_mumbai"), "speed", "City Speed Limits", "Light motor vehicles (cars) have a maximum speed limit of 50 km/h on urban roads.", "Section 112 / 183", "2019-09-01", "https://mahatrafficpolice.gov.in/"),
        (gen_uuid("rule_tn"), gen_uuid("country_in"), gen_uuid("state_tn"), gen_uuid("city_chennai"), "safety", "Pillion Rider Helmet Rule", "Compulsory wearing of helmets by rider and pillion passenger on two-wheelers.", "Section 129", "2022-10-14", "https://tnpolice.gov.in/"),
        (gen_uuid("rule_us_speed"), gen_uuid("country_us"), gen_uuid("state_ny"), gen_uuid("city_nyc"), "speed", "Maximum Speed Limits", "No person shall drive a vehicle at a speed greater than maximum limits.", "VTL §1180", "2020-01-01", "https://ny.gov/"),
        (gen_uuid("rule_uk_speed"), gen_uuid("country_uk"), gen_uuid("state_eng"), gen_uuid("city_london"), "speed", "National Speed Limits", "Do not exceed the national speed limits or local zone limits.", "RTRA §89", "2019-01-01", "https://gov.uk/")
    ]
    cursor.executemany("""
    INSERT INTO traffic_rules (rule_id, country_id, state_id, city_id, category, rule_title, rule_description, section_reference, effective_date, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, traffic_rules)
    
    # 8. Seeding Penalties for Violations, Vehicle Types, and States
    # Format of penalties: (penalty_id, violation_id, vehicle_type_id, country_id, state_id, city_id, first_offense, second_offense, repeat_offense, imprisonment, points, seizure)
    penalties = [
        # OVER SPEEDING
        (gen_uuid("pen_sp_2w"), "speeding", "2w", gen_uuid("country_in"), gen_uuid("state_mh"), None, 1000, 2000, 2000, "No imprisonment", 2, 0, "2019-09-01"),
        (gen_uuid("pen_sp_car_mh"), "speeding", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 1000, 2000, 2000, "No imprisonment", 2, 0, "2019-09-01"),
        (gen_uuid("pen_sp_car_dl"), "speeding", "car", gen_uuid("country_in"), gen_uuid("state_dl"), None, 1500, 3000, 3000, "No imprisonment", 3, 0, "2019-09-01"),
        (gen_uuid("pen_sp_car_tn"), "speeding", "car", gen_uuid("country_in"), gen_uuid("state_tn"), None, 1000, 2000, 2000, "No imprisonment", 2, 0, "2019-09-01"),
        (gen_uuid("pen_sp_heavy"), "speeding", "heavy", gen_uuid("country_in"), gen_uuid("state_mh"), None, 2000, 4000, 4000, "No imprisonment", 2, 0, "2019-09-01"),
        
        # NO HELMET (Only applicable to 2w)
        (gen_uuid("pen_hel_2w_mh"), "no-helmet", "2w", gen_uuid("country_in"), gen_uuid("state_mh"), None, 500, 1500, 1500, "License disqualified for 3 months", 1, 0, "2021-12-01"),
        (gen_uuid("pen_hel_2w_tn"), "no-helmet", "2w", gen_uuid("country_in"), gen_uuid("state_tn"), None, 500, 1500, 1500, "License disqualified for 3 months", 1, 0, "2022-10-01"),
        (gen_uuid("pen_hel_2w_dl"), "no-helmet", "2w", gen_uuid("country_in"), gen_uuid("state_dl"), None, 1000, 2000, 2000, "License disqualified for 3 months", 1, 0, "2020-03-01"),
        
        # DUI DRUNK DRIVING
        (gen_uuid("pen_dui_car_mh"), "dui", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 10000, 15000, 15000, "Up to 6 months jail (first offense), up to 2 years jail (repeat)", 4, 1, "2019-09-01"),
        (gen_uuid("pen_dui_car_tn"), "dui", "car", gen_uuid("country_in"), gen_uuid("state_tn"), None, 10000, 15000, 15000, "Up to 6 months jail (first offense), up to 2 years jail (repeat)", 4, 0, "2019-09-01"),
        (gen_uuid("pen_dui_car_dl"), "dui", "car", gen_uuid("country_in"), gen_uuid("state_dl"), None, 10000, 15000, 15000, "Up to 6 months jail (first offense), arrest possible", 4, 1, "2019-09-01"),
        
        # NO SEATBELT
        (gen_uuid("pen_sb_car_mh"), "no-seatbelt", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 1000, 1000, 1000, "No imprisonment", 1, 0, "2019-09-01"),
        (gen_uuid("pen_sb_car_tn"), "no-seatbelt", "car", gen_uuid("country_in"), gen_uuid("state_tn"), None, 1000, 1000, 1000, "No imprisonment", 1, 0, "2022-10-01"),
        (gen_uuid("pen_sb_car_dl"), "no-seatbelt", "car", gen_uuid("country_in"), gen_uuid("state_dl"), None, 1000, 1000, 1000, "No imprisonment", 1, 0, "2020-03-01"),

        # MOBILE PHONE
        (gen_uuid("pen_mob_car_mh"), "mobile-phone", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 1000, 10000, 10000, "Up to 1 year jail (first offense)", 2, 0, "2021-12-01"),
        (gen_uuid("pen_mob_car_dl"), "mobile-phone", "car", gen_uuid("country_in"), gen_uuid("state_dl"), None, 5000, 10000, 10000, "Up to 1 year jail (first offense)", 2, 0, "2020-03-01"),
        (gen_uuid("pen_mob_car_tn"), "mobile-phone", "car", gen_uuid("country_in"), gen_uuid("state_tn"), None, 1000, 10000, 10000, "Up to 1 year jail (first offense)", 2, 0, "2022-10-01"),

        # SIGNAL JUMPING
        (gen_uuid("pen_sig_car_mh"), "signal-jumping", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 5000, 10000, 10000, "No imprisonment", 2, 0, "2019-09-01"),
        (gen_uuid("pen_sig_car_tn"), "signal-jumping", "car", gen_uuid("country_in"), gen_uuid("state_tn"), None, 5000, 10000, 10000, "No imprisonment", 2, 0, "2022-10-01"),
        (gen_uuid("pen_sig_car_dl"), "signal-jumping", "car", gen_uuid("country_in"), gen_uuid("state_dl"), None, 5000, 10000, 10000, "No imprisonment", 2, 0, "2020-03-01"),

        # WRONG PARKING
        (gen_uuid("pen_park_car_mh"), "wrong-parking", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 500, 1500, 1500, "Towing charges extra", 0, 1, "2021-12-01"),
        (gen_uuid("pen_park_car_dl"), "wrong-parking", "car", gen_uuid("country_in"), gen_uuid("state_dl"), None, 750, 1500, 1500, "Towing charges extra", 0, 1, "2020-03-01"),
        (gen_uuid("pen_park_car_tn"), "wrong-parking", "car", gen_uuid("country_in"), gen_uuid("state_tn"), None, 500, 1500, 1500, "Towing charges extra", 0, 0, "2022-10-01"),

        # NO INSURANCE
        (gen_uuid("pen_ins_car_mh"), "no-insurance", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 2000, 4000, 4000, "Up to 3 months jail", 0, 0, "2019-09-01"),
        
        # NO LICENCE
        (gen_uuid("pen_lic_car_mh"), "no-licence", "car", gen_uuid("country_in"), gen_uuid("state_mh"), None, 5000, 10000, 10000, "Up to 3 months jail", 0, 0, "2019-09-01"),

        # US SPEEDING (US NY)
        (gen_uuid("pen_us_sp_car"), "speeding", "car", gen_uuid("country_us"), gen_uuid("state_ny"), None, 150, 300, 600, "No imprisonment", 3, 0, "2020-01-01"),

        # UK SPEEDING (UK ENG)
        (gen_uuid("pen_uk_sp_car"), "speeding", "car", gen_uuid("country_uk"), gen_uuid("state_eng"), None, 100, 500, 2500, "No imprisonment", 3, 0, "2019-01-01")
    ]
    
    cursor.executemany("""
    INSERT INTO violation_penalties (penalty_id, violation_id, vehicle_type_id, country_id, state_id, city_id, first_offense_fine, second_offense_fine, repeat_offense_fine, imprisonment, license_points, vehicle_seizure, effective_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, penalties)
    
    # 9. FAQ Knowledge Base Seeding
    faq_data = [
        (gen_uuid("faq1"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the speed limit for cars in Mumbai?", "The speed limit for Light Motor Vehicles (LMVs / cars) inside Mumbai municipal/city limits is maximum **50 km/h**. On expressways it goes up to **100-120 km/h**.", "speed"),
        (gen_uuid("faq2"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the fine for driving without a helmet in Maharashtra?", "Not wearing an ISI helmet while riding a two-wheeler in Maharashtra carries a fine of **₹500 for the first offence** and **₹1,500 for repeat offences**. Your driving license may also be suspended/disqualified for 3 months under Section 129 of MVA 2019.", "safety"),
        (gen_uuid("faq3"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the legal limit for alcohol when driving in Maharashtra?", "The legal limit for blood alcohol concentration (BAC) in India is **30 mg per 100 ml of blood**. Driving with a BAC level higher than this is a criminal offense under Section 185, carrying a fine of **₹10,000** and/or up to **6 months in jail** for the first offense.", "dui"),
        (gen_uuid("faq4"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What documents should I carry while driving a car?", "You must carry a valid driving licence, vehicle registration certificate (RC), valid insurance cover certificate, and a valid Pollution Under Control (PUC) certificate. Digital versions on DigiLocker or mParivahan are legally accepted.", "documents"),
        (gen_uuid("faq5"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "Is using a mobile phone with hands-free allowed while driving?", "Yes, using a mobile phone with a hands-free device or dashboard mounting is generally allowed for navigation. However, holding a phone, texting, or dialing while driving is strictly prohibited and carries a fine of **₹1,000 to ₹5,000** (first offense) and **₹10,000** (repeat).", "safety"),
        (gen_uuid("faq6"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the fine for seatbelt violation?", "Not wearing a seatbelt while driving carries a fine of **₹1,000** under Section 194B of the Motor Vehicles Act, 2019.", "safety"),
        (gen_uuid("faq7"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the penalty for jumping a traffic signal?", "Jumping a red traffic light attracts a fine of **₹5,000** (first offense) and up to **₹10,000** (repeat offense) under Section 119/184 of the MVA 2019.", "safety"),
        (gen_uuid("faq8"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the fine for parking in a no-parking zone?", "Wrong parking carries a fine of **₹500** for the first offense under Section 122, plus towing charges as applicable by the local traffic authority.", "parking"),
        (gen_uuid("faq9"), gen_uuid("country_in"), gen_uuid("state_mh"), None, "What is the fine for driving without insurance?", "Driving without a valid third-party insurance policy carries a fine of **₹2,000** and/or up to 3 months imprisonment for the first offense, and **₹4,000** for repeat offenses under Section 196.", "insurance")
    ]
    cursor.executemany("""
    INSERT INTO faq_knowledge (faq_id, country_id, state_id, city_id, question, answer, category)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, faq_data)
    
    # 10. Sync Versions Seeding
    sync_versions = [
        (gen_uuid("ver_rules"), "rules", "1.0.0", "c3ab8efc2"),
        (gen_uuid("ver_penalties"), "penalties", "1.0.0", "f5d0232a9"),
        (gen_uuid("ver_faqs"), "faqs", "1.0.0", "98bc2e4da")
    ]
    cursor.executemany("""
    INSERT INTO sync_versions (version_id, data_type, version_number, checksum)
    VALUES (?, ?, ?, ?);
    """, sync_versions)
    
    # 11. Legal Sources Seeding
    legal_sources = [
        (gen_uuid("src_mva"), gen_uuid("country_in"), gen_uuid("state_mh"), "Ministry of Road Transport and Highways (MoRTH)", "https://morth.nic.in/", "Motor Vehicles (Amendment) Act, 2019", "2019-08-09"),
        (gen_uuid("src_maharashtra"), gen_uuid("country_in"), gen_uuid("state_mh"), "Maharashtra State Transport Department", "https://transport.maharashtra.gov.in/", "Notification on Compounding Fees (Dec 2021)", "2021-12-10"),
        (gen_uuid("src_tamilnadu"), gen_uuid("country_in"), gen_uuid("state_tn"), "Tamil Nadu Home (Transport) Department", "https://tnpolice.gov.in/", "G.O.Ms.No. 839 - Revison of Compounding Fees (Oct 2022)", "2022-10-14"),
        (gen_uuid("src_delhi"), gen_uuid("country_in"), gen_uuid("state_dl"), "Delhi Government Transport Department", "https://transport.delhi.gov.in/", "Compounding Notifications under Section 200 (Mar 2020)", "2020-03-12")
    ]
    cursor.executemany("""
    INSERT INTO legal_sources (source_id, country_id, state_id, source_name, source_url, document_title, publication_date)
    VALUES (?, ?, ?, ?, ?, ?, ?);
    """, legal_sources)
    
    # Seeding Backward Compatibility Challans
    now_ms = int(time.time() * 1000)
    day_ms = 24 * 60 * 60 * 1000
    challans = [
        (
            'ch-001',
            'TN-58392-2026',
            'TN01AB1234',
            'Riding without Helmet',
            'T. Nagar Metro Jn, Chennai',
            1000,
            'pending',
            now_ms - 5 * day_ms,
            now_ms + 10 * day_ms,
            '194D',
            'Motor Vehicles Act 2019',
            'Suspension of driving license for up to 3 months on failure to pay before deadline or court summoning.'
        ),
        (
            'ch-002',
            'TN-19402-2026',
            'TN01AB1234',
            'Over-Speeding LMV',
            'Anna Salai (Anna Road), Chennai',
            1000,
            'pending',
            now_ms - 2 * day_ms,
            now_ms + 13 * day_ms,
            '183(1)(i)',
            'Motor Vehicles Act 2019',
            'Deduction of 2 license points. Repeat offense will attract double the fine and possible license suspension for 3 months.'
        ),
        (
            'ch-003',
            'MH-23912-2026',
            'MH12CD5678',
            'Driving Uninsured Vehicle',
            'Senapati Bapat Road, Pune',
            2000,
            'pending',
            now_ms - 3 * day_ms,
            now_ms + 12 * day_ms,
            '196',
            'Motor Vehicles Act 2019',
            'First offence: Imprisonment up to 3 months or fine up to Rs 2000, or both.'
        )
    ]
    cursor.executemany("""
    INSERT INTO challans (id, challan_number, vehicle_number, violation_name, location, amount, status, issued_at, deadline_at, section, act, consequences)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    """, challans)

    # Seeding Backward Compatibility Notifications
    notifications = [
        (
            'notif-001',
            'law_change',
            'New speed limits notified in Delhi NCR',
            'Speed limits for Light Motor Vehicles (LMVs) have been revised to maximum 70 km/h on signature bridges and major bypass roads under Delhi Traffic Police regulations.',
            0,
            now_ms - 1 * day_ms
        ),
        (
            'notif-002',
            'challan_reminder',
            'Pending Challan TN-58392-2026 deadline is approaching!',
            'Your pending challan for "Riding without Helmet" in Chennai is due in 3 days. Please pay online via official parivahan portal to avoid court prosecution.',
            0,
            now_ms - 2 * day_ms
        ),
        (
            'notif-003',
            'safety_tip',
            'Wear a helmet to save lives.',
            'Wearing an ISI-certified helmet reduces the risk of head injury by 60% and death by 40% in two-wheeler crashes. Ride safe!',
            0,
            now_ms - 4 * day_ms
        ),
        (
            'notif-004',
            'app_update',
            'Offline pack updated for Tamil Nadu',
            'The local regulations database pack for Tamil Nadu revised October 2022 compounding schedule has been successfully synced and cached for offline usage.',
            0,
            now_ms - 5 * day_ms
        )
    ]
    cursor.executemany("""
    INSERT INTO notifications (id, type, title, body, read, timestamp)
    VALUES (?, ?, ?, ?, ?, ?);
    """, notifications)

    conn.commit()
    conn.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
