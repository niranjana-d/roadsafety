from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
import uuid
import time
from database import get_db_connection

app = FastAPI(title="DriveLegal Backend API", version="1.0.0")

@app.on_event("startup")
def on_startup():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "drivelegal.db")
    needs_seeding = False
    if not os.path.exists(db_path):
        needs_seeding = True
    else:
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM states;")
            count = cursor.fetchone()[0]
            if count < 10:
                needs_seeding = True
            conn.close()
        except Exception:
            needs_seeding = True
            
    if needs_seeding:
        print("Database not found or incomplete. Seeding database...")
        from seed_data import seed_database
        try:
            seed_database()
            print("Database seeded successfully on startup.")
        except Exception as e:
            print(f"Error seeding database on startup: {e}")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SyncItem(BaseModel):
    device_id: str
    violation_id: str
    state_code: str
    vehicle_type: str
    fine_amount: int
    timestamp: int

class SyncRequest(BaseModel):
    device_id: str
    logs: List[SyncItem]

class VehicleItem(BaseModel):
    id: str
    name: str
    type: str
    registration_state: Optional[str] = None
    registration_number: Optional[str] = None

class ProfileRequest(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    safety_score: int = 85
    country: str = "IN"
    state_code: str = "MH"
    city: str = "Mumbai"
    vehicles: List[VehicleItem]

class ChatRequest(BaseModel):
    message: str
    state_code: Optional[str] = "MH"
    language: Optional[str] = "en"

class CalculateRequest(BaseModel):
    violation_id: str
    vehicle_type_id: str
    state_code: str
    offense_number: int = 1
    city_name: Optional[str] = None

# Helper to map state code to UUID or name
def get_state_details(cursor, state_code: str):
    cursor.execute("SELECT * FROM states WHERE UPPER(state_code) = ?;", (state_code.upper(),))
    return cursor.fetchone()

# Endpoints
@app.get("/api/states")
def get_states():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    SELECT s.state_code as code, s.state_name as name, 
           (SELECT COUNT(*) FROM violation_penalties vp WHERE vp.state_id = s.state_id) as rules_count
    FROM states s
    JOIN countries c ON s.country_id = c.country_id
    WHERE c.country_code = 'IN';
    """)
    rows = cursor.fetchall()
    conn.close()
    
    # If empty, return fallback defaults
    if not rows:
        return [
            {"code": "TN", "name": "Tamil Nadu", "rules_count": 12},
            {"code": "MH", "name": "Maharashtra", "rules_count": 12},
            {"code": "DL", "name": "New Delhi", "rules_count": 12}
        ]
    return [dict(row) for row in rows]

@app.get("/api/cities")
def get_cities(state_code: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    if state_code:
        cursor.execute("""
        SELECT c.city_name as name, s.state_code as state
        FROM cities c
        JOIN states s ON c.state_id = s.state_id
        WHERE UPPER(s.state_code) = ?;
        """, (state_code.upper(),))
    else:
        cursor.execute("""
        SELECT c.city_name as name, s.state_code as state
        FROM cities c
        JOIN states s ON c.state_id = s.state_id;
        """)
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

@app.get("/api/categories")
def get_categories():
    return ["Speed", "Parking", "Documents", "Safety", "DUI", "General"]

@app.get("/api/rules")
def get_rules(state: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Standard query joining violations and penalties
    if state:
        state_row = get_state_details(cursor, state)
        if not state_row:
            # Fallback if state code not found in seed
            cursor.execute("SELECT * FROM states LIMIT 1;")
            state_row = cursor.fetchone()
            
        state_id = state_row["state_id"] if state_row else "state_mh"
        
        cursor.execute("""
        SELECT v.violation_id, 'V' || substr(v.violation_id, 1, 2) as code, 
               COALESCE(vp.penalty_id, '') as penalty_id,
               tr.section_reference as section, v.violation_name as title, 
               v.description, vp.first_offense_fine as base_fine, 
               vp.repeat_offense_fine as max_fine, vp.imprisonment as imprisonment_text,
               1.0 as multiplier, vp.first_offense_fine as compounding_fee, 
               (CASE WHEN v.category = 'dui' THEN 0 ELSE 1 END) as is_compoundable,
               'Penalty rules apply as per state regulations' as state_specific_notes
        FROM violations v
        LEFT JOIN violation_penalties vp ON v.violation_id = vp.violation_id AND vp.state_id = ?
        LEFT JOIN traffic_rules tr ON v.category = tr.category AND tr.state_id = ?
        GROUP BY v.violation_id;
        """, (state_id, state_id))
    else:
        cursor.execute("""
        SELECT v.violation_id, 'V' || substr(v.violation_id, 1, 2) as code, 
               tr.section_reference as section, v.violation_name as title, 
               v.description, 1000 as base_fine, 2000 as max_fine, 
               'No imprisonment' as imprisonment_text,
               NULL as multiplier, NULL as compounding_fee, NULL as is_compoundable, NULL as state_specific_notes
        FROM violations v
        LEFT JOIN traffic_rules tr ON v.category = tr.category
        GROUP BY v.violation_id;
        """)
        
    rows = cursor.fetchall()
    conn.close()
    
    rules = []
    for row in rows:
        rules.append({
            "violation_id": row["violation_id"],
            "code": row["code"] or "V01",
            "section": row["section"] or "177 MVA",
            "title": row["title"],
            "description": row["description"],
            "base_fine": row["base_fine"] or 1000,
            "max_fine": row["max_fine"] or 2000,
            "imprisonment_text": row["imprisonment_text"] or "No imprisonment",
            "multiplier": row["multiplier"],
            "compounding_fee": row["compounding_fee"],
            "is_compoundable": bool(row["is_compoundable"]) if row["is_compoundable"] is not None else None,
            "state_specific_notes": row["state_specific_notes"]
        })
    return rules

@app.get("/api/rules/{state}/download")
def download_state_pack(state: str):
    state_upper = state.upper()
    valid_states = ["TN", "MH", "DL", "KA", "GJ", "UP"]
    if state_upper not in valid_states:
        raise HTTPException(status_code=400, detail="State not supported in this version.")
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    state_row = get_state_details(cursor, state_upper)
    if not state_row:
        raise HTTPException(status_code=404, detail="State details not found.")
        
    state_id = state_row["state_id"]
    state_name = state_row["state_name"]
    
    cursor.execute("""
    SELECT v.violation_id, 'V' || substr(v.violation_id, 1, 2) as code, 
           tr.section_reference as section, v.violation_name as title, 
           v.description, vp.first_offense_fine as base_fine, 
           vp.repeat_offense_fine as max_fine, vp.imprisonment as imprisonment_text,
           1.0 as multiplier, vp.first_offense_fine as compounding_fee, 
           (CASE WHEN v.category = 'dui' THEN 0 ELSE 1 END) as is_compoundable,
           'Compounding fee updated as per compounding schedule' as state_specific_notes
    FROM violations v
    JOIN violation_penalties vp ON v.violation_id = vp.violation_id AND vp.state_id = ?
    LEFT JOIN traffic_rules tr ON v.category = tr.category AND tr.state_id = ?
    GROUP BY v.violation_id;
    """, (state_id, state_id))
    
    rows = cursor.fetchall()
    conn.close()
    
    rules = []
    for row in rows:
        rules.append({
            "violation_id": row["violation_id"],
            "code": row["code"] or "V01",
            "section": row["section"] or "177 MVA",
            "title": row["title"],
            "description": row["description"],
            "base_fine": row["base_fine"] or 1000,
            "max_fine": row["max_fine"] or 2000,
            "imprisonment_text": row["imprisonment_text"] or "No imprisonment",
            "multiplier": row["multiplier"],
            "compounding_fee": row["compounding_fee"] or 1000,
            "is_compoundable": bool(row["is_compoundable"]),
            "state_specific_notes": row["state_specific_notes"]
        })
        
    return {
        "state_code": state_upper,
        "state_name": state_name,
        "version": "1.0.0",
        "downloaded_at": int(time.time()), 
        "rules": rules
    }

@app.post("/api/sync")
def sync_offline_logs(request: SyncRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    inserted_count = 0
    for log in request.logs:
        # Insert into retro-compatible sync_queue
        cursor.execute("""
        INSERT INTO sync_queue (device_id, violation_id, state_code, vehicle_type, fine_amount, timestamp)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (request.device_id, log.violation_id, log.state_code, log.vehicle_type, log.fine_amount, log.timestamp))
        
        # Insert into structured calculations log table
        state_row = get_state_details(cursor, log.state_code)
        state_id = state_row["state_id"] if state_row else "state_mh"
        
        # Determine vehicle type id
        cursor.execute("SELECT vehicle_type_id FROM vehicle_types WHERE vehicle_name LIKE ? OR vehicle_type_id = ? LIMIT 1;", 
                       (f"%{log.vehicle_type}%", log.vehicle_type.lower()[:3]))
        vtype = cursor.fetchone()
        vtype_id = vtype["vehicle_type_id"] if vtype else "car"
        
        cursor.execute("""
        INSERT INTO challan_calculations (calculation_id, vehicle_type_id, violation_id, state_id, offense_number, calculated_fine)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (str(uuid.uuid4()), vtype_id, log.violation_id, state_id, 1, log.fine_amount))
        
        inserted_count += 1
        
    conn.commit()
    conn.close()
    
    return {
        "status": "success",
        "synced_count": inserted_count,
        "last_sync_at": int(time.time())
    }

@app.post("/api/calculate")
def calculate_fine(req: CalculateRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. State details
    state_row = get_state_details(cursor, req.state_code)
    if not state_row:
        # fallback to Maharashtra if not found
        cursor.execute("SELECT * FROM states WHERE state_code = 'MH';")
        state_row = cursor.fetchone()
    
    state_id = state_row["state_id"]
    state_name = state_row["state_name"]
    
    # 2. Vehicle details
    cursor.execute("SELECT * FROM vehicle_types WHERE vehicle_type_id = ? OR vehicle_name = ?;", (req.vehicle_type_id, req.vehicle_type_id))
    v_row = cursor.fetchone()
    if not v_row:
        # default to car
        cursor.execute("SELECT * FROM vehicle_types WHERE vehicle_type_id = 'car';")
        v_row = cursor.fetchone()
        
    v_type_id = v_row["vehicle_type_id"] if v_row else "car"
    v_name = v_row["vehicle_name"] if v_row else "Light Motor Vehicle"
    
    # 3. Fetch penalty
    cursor.execute("""
    SELECT vp.*, v.violation_name, v.category, tr.section_reference
    FROM violations v
    LEFT JOIN violation_penalties vp ON v.violation_id = vp.violation_id AND vp.vehicle_type_id = ? AND vp.state_id = ?
    LEFT JOIN traffic_rules tr ON v.category = tr.category AND tr.state_id = ?
    WHERE v.violation_id = ?;
    """, (v_type_id, state_id, state_id, req.violation_id))
    
    penalty_row = cursor.fetchone()
    
    if not penalty_row:
        # Fallback if state specific penalty not found, fetch default (MH)
        cursor.execute("SELECT state_id FROM states WHERE state_code = 'MH';")
        mh_state = cursor.fetchone()
        mh_state_id = mh_state["state_id"] if mh_state else ""
        
        cursor.execute("""
        SELECT vp.*, v.violation_name, v.category, tr.section_reference
        FROM violations v
        LEFT JOIN violation_penalties vp ON v.violation_id = vp.violation_id AND vp.vehicle_type_id = ? AND vp.state_id = ?
        LEFT JOIN traffic_rules tr ON v.category = tr.category AND tr.state_id = ?
        WHERE v.violation_id = ?;
        """, (v_type_id, mh_state_id, mh_state_id, req.violation_id))
        penalty_row = cursor.fetchone()
        
    if not penalty_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Violation or penalty configuration not found.")
        
    # Get fine by offense number
    if req.offense_number == 1:
        base_fine = penalty_row["first_offense_fine"] or 1000
    elif req.offense_number == 2:
        base_fine = penalty_row["second_offense_fine"] or penalty_row["repeat_offense_fine"] or 2000
    else:
        base_fine = penalty_row["repeat_offense_fine"] or 2000
        
    surcharge = 0
    # Add minor surcharges for specific categories
    if penalty_row["category"] == "speed" and req.state_code.upper() in ["DL", "KA"]:
        surcharge = 100
    elif penalty_row["category"] == "parking":
        surcharge = 100
        
    compounding_fee = base_fine
    total_fine = base_fine + surcharge
    
    # Save log
    calc_id = str(uuid.uuid4())
    cursor.execute("""
    INSERT INTO challan_calculations (calculation_id, vehicle_type_id, violation_id, state_id, offense_number, calculated_fine)
    VALUES (?, ?, ?, ?, ?, ?);
    """, (calc_id, v_type_id, req.violation_id, state_id, req.offense_number, total_fine))
    
    conn.commit()
    conn.close()
    
    return {
        "calculation_id": calc_id,
        "violation_id": req.violation_id,
        "violation_name": penalty_row["violation_name"],
        "vehicle_type": v_name,
        "state_code": req.state_code,
        "state_name": state_name,
        "is_repeat": req.offense_number > 1,
        "base_fine": base_fine,
        "surcharge": surcharge,
        "compounding_fee": compounding_fee,
        "total_fine": total_fine,
        "licence_points": penalty_row["license_points"] or 0,
        "imprisonment": penalty_row["imprisonment"] or "",
        "section": penalty_row["section_reference"] or "177 MVA",
        "act": "Motor Vehicles Act 2019",
        "vehicle_seizure": bool(penalty_row["vehicle_seizure"]),
        "calculated_at": int(time.time() * 1000)
    }

@app.post("/api/chat")
def chat_bot(req: ChatRequest):
    import re
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query = req.message.lower()
    # Clean punctuation for robust keyword and SQL LIKE matching
    query_clean = re.sub(r"[?!.,;:]", " ", query).strip()
    query_clean = " ".join(query_clean.split())
    
    is_location_query = any(kw in query_clean for kw in ["current location", "where am i", "my location", "which city", "what city"])
    is_violation_query = any(kw in query_clean for kw in ["speed", "helmet", "signal", "seatbelt", "drunk", "drink", "alcohol", "dui", "phone", "mobile", "park", "insur", "licence", "license", "puc", "pollution", "overload", "danger", "rash", "wrong side", "registr", "horn", "honk", "document", "papers"])
    
    # Check for current location question (only if not also asking about a violation)
    if is_location_query and not is_violation_query:
        state_code = req.state_code.upper() if req.state_code else "MH"
        state_row = get_state_details(cursor, state_code)
        state_name = state_row["state_name"] if state_row else "Maharashtra"
        
        answer = f"Your active location context is set to **{state_name} ({state_code})**. All calculations, laws, and citations will be filtered for this state. You can update this context at any time using the location selector in the top bar."
        citations = [{
            "id": "cite-location",
            "section": "Location Settings",
            "act": "DriveLegal Configuration",
            "title": "State Context"
        }]
        conn.close()
        return {"answer": answer, "citations": citations}
        
    # Check for active challans question
    if any(kw in query_clean for kw in ["active challan", "pending fine", "my challan", "challan to pay", "fines to pay", "any challan"]):
        cursor.execute("SELECT * FROM challans WHERE status = 'pending';")
        rows = cursor.fetchall()
        if not rows:
            answer = "✅ **No active challans found** in the database. You have a clean driving record!"
        else:
            answer = f"I checked the database and found **{len(rows)} pending challan(s)**:\n\n"
            for idx, r in enumerate(rows):
                answer += f"### {idx+1}. Vehicle: {r['vehicle_number']} (Challan: {r['challan_number']})\n"
                answer += f"- **Violation**: {r['violation_name']} at {r['location']}\n"
                answer += f"- **Amount**: ₹{r['amount']:,} (Section {r['section']})\n"
                answer += f"- **Status**: Pending\n"
                answer += f"- **Consequences**: {r['consequences']}\n\n"
            answer += "You can clear these fines directly via the official online portal."
            
        citations = []
        for r in rows[:2]:
            citations.append({
                "id": f"cite-challan-{r['id']}",
                "section": r["section"],
                "act": r["act"],
                "title": r["violation_name"]
            })
        conn.close()
        return {"answer": answer, "citations": citations}
    
    # 1. Resolve State/City dynamically by searching database entries in message text
    state_code = req.state_code.upper() if req.state_code else "MH"
    city_name = None
    
    # Check if any state name from DB is mentioned in the query
    cursor.execute("SELECT state_code, state_name FROM states;")
    db_states = cursor.fetchall()
    matched_state_by_name = None
    for s in db_states:
        if s["state_name"].lower() in query_clean:
            matched_state_by_name = s
            break
            
    if matched_state_by_name:
        state_code = matched_state_by_name["state_code"]
    else:
        # Check if any city name from DB is mentioned in the query
        cursor.execute("SELECT c.city_name, s.state_code FROM cities c JOIN states s ON c.state_id = s.state_id;")
        db_cities = cursor.fetchall()
        for c in db_cities:
            if c["city_name"].lower() in query_clean:
                city_name = c["city_name"]
                state_code = c["state_code"]
                break
                
    # Also support specific overrides if city_name was not populated but state was matched
    if not city_name:
        # Match using word boundaries to prevent substring clashes like "la" matching in "kerala"
        if re.search(r"\bmumbai\b", query_clean):
            city_name = "Mumbai"
            state_code = "MH"
        elif re.search(r"\bpune\b", query_clean):
            city_name = "Pune"
            state_code = "MH"
        elif re.search(r"\bchennai\b", query_clean):
            city_name = "Chennai"
            state_code = "TN"
        elif re.search(r"\bdelhi\b|\bnew delhi\b", query_clean):
            city_name = "New Delhi"
            state_code = "DL"
        elif re.search(r"\bbengaluru\b|\bbangalore\b", query_clean):
            city_name = "Bengaluru"
            state_code = "KA"
        elif re.search(r"\blondon\b", query_clean):
            city_name = "London"
            state_code = "ENG"
        elif re.search(r"\bnyc\b|\bnew york\b", query_clean):
            city_name = "New York City"
            state_code = "NY"
        elif re.search(r"\blos angeles\b|\bla\b", query_clean):
            city_name = "Los Angeles"
            state_code = "CA"
        
    state_row = get_state_details(cursor, state_code)
    if not state_row:
        cursor.execute("SELECT * FROM states WHERE state_code = 'MH';")
        state_row = cursor.fetchone()
        
    state_id = state_row["state_id"] if state_row else "state_mh"
    state_name = state_row["state_name"] if state_row else "Maharashtra"
    
    # 2. Resolve Vehicle Type based on query keywords
    vehicle_type_id = "car" # default
    vehicle_disp_name = "Car / Light Motor Vehicle"
    if any(kw in query_clean for kw in ["bike", "motorcycle", "scooter", "two-wheeler", "2w", "two wheeler"]):
        vehicle_type_id = "2w"
        vehicle_disp_name = "Two-Wheeler"
    elif any(kw in query_clean for kw in ["auto", "rickshaw", "three-wheeler", "3w"]):
        vehicle_type_id = "auto"
        vehicle_disp_name = "Auto Rickshaw"
    elif any(kw in query_clean for kw in ["truck", "lorry", "bus", "heavy", "hmv"]):
        vehicle_type_id = "heavy"
        vehicle_disp_name = "Heavy Motor Vehicle"
    elif "commercial" in query_clean or "van" in query_clean:
        vehicle_type_id = "commercial"
        vehicle_disp_name = "Medium Commercial Vehicle"
 
    # 3. Resolve Violation Type based on query keywords
    violation_id = None
    if "speed" in query_clean or "fast" in query_clean or "limit" in query_clean:
        violation_id = "speeding"
    elif "helmet" in query_clean or "headgear" in query_clean:
        violation_id = "no-helmet"
    elif "signal" in query_clean or "red light" in query_clean or "traffic light" in query_clean:
        violation_id = "signal-jumping"
    elif "seatbelt" in query_clean or "seat belt" in query_clean:
        violation_id = "no-seatbelt"
    elif any(kw in query_clean for kw in ["drunk", "drink", "alcohol", "dui", "drinking"]):
        violation_id = "dui"
    elif any(kw in query_clean for kw in ["phone", "mobile", "texting", "call", "handheld"]):
        violation_id = "mobile-phone"
    elif "park" in query_clean:
        violation_id = "wrong-parking"
    elif "insur" in query_clean:
        violation_id = "no-insurance"
    elif any(kw in query_clean for kw in ["licence", "license", "document", "documents", "paper", "papers"]):
        violation_id = "no-licence"
    elif any(kw in query_clean for kw in ["puc", "pollution", "emission", "smoke"]):
        violation_id = "no-puc"
    elif "overload" in query_clean:
        violation_id = "overloading"
    elif any(kw in query_clean for kw in ["danger", "rash", "reckless", "negligent"]):
        violation_id = "dangerous-driving"
    elif "wrong side" in query_clean or "opposite" in query_clean:
        violation_id = "wrong-side"
    elif "registr" in query_clean:
        violation_id = "no-registration"
    elif "horn" in query_clean or "honk" in query_clean:
        violation_id = "honking-silence-zone"

    # Case A: User is asking about a specific violation
    if violation_id:
        # Fetch the penalty details
        cursor.execute("""
        SELECT vp.*, v.violation_name, v.description as violation_desc, v.category
        FROM violation_penalties vp
        JOIN violations v ON vp.violation_id = v.violation_id
        WHERE vp.violation_id = ? AND vp.vehicle_type_id = ? AND vp.state_id = ?;
        """, (violation_id, vehicle_type_id, state_id))
        row = cursor.fetchone()
        
        # Fallback if state specific not found, query default (MH)
        if not row:
            cursor.execute("SELECT state_id FROM states WHERE state_code = 'MH';")
            mh_state = cursor.fetchone()
            mh_state_id = mh_state["state_id"] if mh_state else ""
            cursor.execute("""
            SELECT vp.*, v.violation_name, v.description as violation_desc, v.category
            FROM violation_penalties vp
            JOIN violations v ON vp.violation_id = v.violation_id
            WHERE vp.violation_id = ? AND vp.vehicle_type_id = ? AND vp.state_id = ?;
            """, (violation_id, vehicle_type_id, mh_state_id))
            row = cursor.fetchone()
            
        if row:
            # Fetch corresponding traffic rule
            cursor.execute("""
            SELECT * FROM traffic_rules 
            WHERE state_id = ? AND category = ? LIMIT 1;
            """, (state_id, row["category"]))
            rule_row = cursor.fetchone()
            
            section_ref = rule_row["section_reference"] if rule_row and rule_row["section_reference"] else "Section 177"
            act_name = "Motor Vehicles Act 2019"
            
            answer = f"According to real-time traffic rules in **{state_name}** for **{vehicle_disp_name}**:\n\n"
            answer += f"🚨 **Violation**: {row['violation_name']}\n"
            answer += f"📖 **Details**: {row['violation_desc']}\n"
            answer += f"📜 **Legal Provision**: {act_name} {section_ref}\n\n"
            answer += f"💰 **First Offence Fine**: ₹{row['first_offense_fine']:,}\n"
            if row['second_offense_fine'] or row['repeat_offense_fine']:
                rep_fine = row['second_offense_fine'] or row['repeat_offense_fine']
                answer += f"🔄 **Repeat Offence Fine**: ₹{rep_fine:,}\n"
            if row['license_points'] and row['license_points'] > 0:
                answer += f"⚠️ **Penalty Points**: {row['license_points']} points on Driving License\n"
            if row['imprisonment']:
                answer += f"⚖️ **Imprisonment**: {row['imprisonment']}\n"
            if row['vehicle_seizure']:
                answer += "🚗 **Vehicle Seizure**: Yes, authorized authorities can impound the vehicle.\n"
                
            if city_name:
                answer += f"\n*This search was filtered specifically for municipal guidelines in {city_name}.*"
                
            citations = [{
                "id": f"cite-{violation_id}",
                "section": section_ref,
                "act": act_name,
                "title": row['violation_name']
            }]
            
            conn.close()
            return {"answer": answer, "citations": citations}

    # Case B: Check general FAQ table using case-insensitive LIKE search
    cursor.execute("""
    SELECT question, answer, category FROM faq_knowledge 
    WHERE state_id = ? AND (question LIKE ? OR answer LIKE ?) LIMIT 1;
    """, (state_id, f"%{query_clean}%", f"%{query_clean}%"))
    faq_row = cursor.fetchone()
    
    if not faq_row:
        # Check global FAQ matching search text
        cursor.execute("""
        SELECT question, answer, category FROM faq_knowledge 
        WHERE question LIKE ? OR answer LIKE ? LIMIT 1;
        """, (f"%{query_clean}%", f"%{query_clean}%"))
        faq_row = cursor.fetchone()

    if faq_row:
        answer = faq_row["answer"]
        
        # Dynamically customize answer text for the active state/city
        state_code_req = req.state_code.upper() if req.state_code else "MH"
        state_row_req = get_state_details(cursor, state_code_req)
        if state_row_req:
            state_name_req = state_row_req["state_name"]
            cursor.execute("SELECT city_name FROM cities WHERE state_id = ? LIMIT 1;", (state_row_req["state_id"],))
            city_row_req = cursor.fetchone()
            city_name_req = city_row_req["city_name"] if city_row_req else (state_name_req + " City")
            
            # Replace occurrences of seeded placeholder states and cities in general FAQ answers
            answer = answer.replace("Maharashtra", state_name_req)
            answer = answer.replace("Mumbai", city_name_req)
            answer = answer.replace("Pune", city_name_req)
            
        category = faq_row["category"]
        cursor.execute("SELECT * FROM violations WHERE category = ? LIMIT 1;", (category,))
        v_row = cursor.fetchone()
        citations = [{
            "id": f"cite-{v_row['violation_id']}" if v_row else "cite-gen",
            "section": "Section 112/129" if category == "safety" else "Section 185" if category == "dui" else "Section 177",
            "act": "Motor Vehicles Act 2019",
            "title": v_row["violation_name"] if v_row else "Traffic Guidelines"
        }]
        conn.close()
        return {"answer": answer, "citations": citations}

    # Case C: Fallback guidance
    answer = "I'm your **DriveLegal Real-time Assistant**. I can query road laws, penalties, and traffic guidelines directly from the structured database for India, US, and UK.\n\n"
    answer += "Please ask me a specific question, like:\n"
    answer += "- *'What is the speed limit or speeding fine in Mumbai?'*\n"
    answer += "- *'helmet fine in Chennai for a bike?'*\n"
    answer += "- *'What is the drunk driving penalty in Delhi?'*\n"
    answer += "- *'documents needed while driving?'*"
    
    citations = [{
        "id": "cite-general",
        "section": "General",
        "act": "Motor Vehicles Act 2019",
        "title": "Road Safety Guide"
    }]
    
    conn.close()
    return {"answer": answer, "citations": citations}

@app.get("/api/profile/{device_id}")
def get_profile(device_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if profile exists
    cursor.execute("SELECT * FROM profile WHERE device_id = ?;", (device_id,))
    profile_row = cursor.fetchone()
    
    if not profile_row:
        # Create a default profile
        cursor.execute("""
        INSERT INTO profile (device_id, name, email, phone, safety_score, country, state_code, city)
        VALUES (?, 'Mock Driver', '', '', 85, 'IN', 'MH', 'Mumbai');
        """, (device_id,))
        conn.commit()
        cursor.execute("SELECT * FROM profile WHERE device_id = ?;", (device_id,))
        profile_row = cursor.fetchone()
        
    # Get vehicles
    cursor.execute("SELECT * FROM vehicles WHERE device_id = ?;", (device_id,))
    vehicle_rows = cursor.fetchall()
    conn.close()
    
    vehicles = []
    for v in vehicle_rows:
        vehicles.append({
            "id": v["id"],
            "name": v["name"],
            "type": v["type"],
            "registration_state": v["registration_state"],
            "registration_number": v["registration_number"]
        })
        
    return {
        "device_id": profile_row["device_id"],
        "name": profile_row["name"],
        "email": profile_row["email"],
        "phone": profile_row["phone"],
        "safety_score": profile_row["safety_score"],
        "country": profile_row["country"],
        "state_code": profile_row["state_code"],
        "city": profile_row["city"],
        "vehicles": vehicles
    }

@app.post("/api/profile/{device_id}")
def update_profile(device_id: str, profile: ProfileRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Upsert profile
    cursor.execute("""
    INSERT INTO profile (device_id, name, email, phone, safety_score, country, state_code, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(device_id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        phone = excluded.phone,
        safety_score = excluded.safety_score,
        country = excluded.country,
        state_code = excluded.state_code,
        city = excluded.city;
    """, (device_id, profile.name, profile.email, profile.phone, profile.safety_score, profile.country, profile.state_code, profile.city))
    
    # Re-insert vehicles
    cursor.execute("DELETE FROM vehicles WHERE device_id = ?;", (device_id,))
    for v in profile.vehicles:
        cursor.execute("""
        INSERT INTO vehicles (id, device_id, name, type, registration_state, registration_number)
        VALUES (?, ?, ?, ?, ?, ?);
        """, (v.id, device_id, v.name, v.type, v.registration_state, v.registration_number))
        
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.get("/api/user/challans")
def get_challans(plate: str):
    import re
    import hashlib
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    plate_clean = plate.upper().replace(" ", "").replace("-", "")
    cursor.execute("SELECT * FROM challans WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = ?;", (plate_clean,))
    rows = cursor.fetchall()
    
    # If no challans exist, generate realistic ones dynamically!
    if not rows:
        m = re.match(r"^([A-Z]{2})[0-9]", plate_clean)
        state_code = m.group(1) if m else "MH"
        
        # Verify if the state exists in database
        cursor.execute("SELECT * FROM states WHERE UPPER(state_code) = ?;", (state_code,))
        state_row = cursor.fetchone()
        if not state_row:
            state_code = "MH"
            cursor.execute("SELECT * FROM states WHERE state_code = 'MH';")
            state_row = cursor.fetchone()
            
        state_id = state_row["state_id"] if state_row else "state_mh"
        state_name = state_row["state_name"] if state_row else "Maharashtra"
        
        # Deterministic generation using plate hash
        plate_hash = int(hashlib.md5(plate_clean.encode('utf-8')).hexdigest(), 16)
        challan_count = (plate_hash % 2) + 1 # 1 or 2 challans (guarantees dynamic challans exist)
        
        if challan_count > 0:
            now_ms = int(time.time() * 1000)
            day_ms = 24 * 60 * 60 * 1000
            
            # Possible violations
            possible_violations = [
                ("speeding", "Over-Speeding LMV", 1000, "183(1)(i)", "Deduction of 2 license points. Repeat offense will attract double the fine and possible license suspension for 3 months."),
                ("no-helmet", "Riding without Helmet", 1000, "194D", "Suspension of driving license for up to 3 months on failure to pay before deadline or court summoning."),
                ("no-seatbelt", "Driving without Seatbelt", 1000, "194B", "Fine of Rs 1000. Safety warning on record."),
                ("wrong-parking", "Wrong Parking Violation", 500, "122", "Obstructing traffic. Fine of Rs 500 plus towing charges."),
                ("no-puc", "Driving without PUC Certificate", 10000, "190(2)", "First offence: fine of Rs 10,000 and license suspension for 3 months."),
                ("mobile-phone", "Using Handheld Phone while Driving", 5000, "184(c)", "First offence: fine of Rs 5000 and possible jail up to 1 year.")
            ]
            
            v1_idx = plate_hash % len(possible_violations)
            v2_idx = (plate_hash + 1) % len(possible_violations)
            
            selected_violations = [possible_violations[v1_idx]]
            if challan_count > 1:
                selected_violations.append(possible_violations[v2_idx])
                
            # Fetch cities for this state to make the location realistic
            cursor.execute("SELECT city_name FROM cities WHERE state_id = ?;", (state_id,))
            city_rows = cursor.fetchall()
            cities = [r["city_name"] for r in city_rows] if city_rows else [state_name + " Highway"]
            
            for idx, (violation_id, v_name, amount, section, consequences) in enumerate(selected_violations):
                ch_id = f"ch-gen-{plate_clean}-{idx}"
                ch_num = f"{state_code}-{plate_hash % 100000:05d}-{2026}"
                location = f"{cities[idx % len(cities)]} Junction, {state_name}"
                
                cursor.execute("""
                INSERT INTO challans (id, challan_number, vehicle_number, violation_name, location, amount, status, issued_at, deadline_at, section, act, consequences)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
                """, (
                    ch_id,
                    ch_num,
                    plate.upper(),
                    v_name,
                    location,
                    amount,
                    'pending',
                    now_ms - (idx + 1) * 3 * day_ms,
                    now_ms + (10 - idx * 4) * day_ms,
                    section,
                    'Motor Vehicles Act 2019',
                    consequences
                ))
            conn.commit()
            
            # Query again to return the newly generated database rows
            cursor.execute("SELECT * FROM challans WHERE UPPER(REPLACE(vehicle_number, ' ', '')) = ?;", (plate_clean,))
            rows = cursor.fetchall()
            
    conn.close()
    
    challans = []
    for row in rows:
        challans.append({
            "id": row["id"],
            "challanNumber": row["challan_number"],
            "vehicleNumber": row["vehicle_number"],
            "violationName": row["violation_name"],
            "location": row["location"],
            "amount": row["amount"],
            "status": row["status"],
            "issuedAt": row["issued_at"],
            "deadlineAt": row["deadline_at"],
            "section": row["section"],
            "act": row["act"],
            "consequences": row["consequences"]
        })
    return {"challans": challans}

@app.get("/api/notifications")
def get_notifications():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM notifications ORDER BY timestamp DESC;")
    rows = cursor.fetchall()
    conn.close()
    
    notifs = []
    for row in rows:
        notifs.append({
            "id": row["id"],
            "type": row["type"],
            "title": row["title"],
            "body": row["body"],
            "read": bool(row["read"]),
            "timestamp": row["timestamp"]
        })
    return notifs

@app.post("/api/notifications/{id}/read")
def mark_notification_read(id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read = 1 WHERE id = ?;", (id,))
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/notifications/mark-all-read")
def mark_all_notifications_read():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE notifications SET read = 1;")
    conn.commit()
    conn.close()
    return {"status": "success"}

@app.post("/api/notifications/clear-all")
def clear_all_notifications():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM notifications;")
    conn.commit()
    conn.close()
    return {"status": "success"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
