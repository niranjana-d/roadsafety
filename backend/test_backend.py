import unittest
from fastapi.testclient import TestClient
import os
import sys

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from database import get_db_connection
from seed_data import seed_database

class TestDriveLegalBackend(unittest.TestCase):
    def setUp(self):
        # Refresh database content before each test for proper isolation
        seed_database()
        self.client = TestClient(app)

    def test_get_states(self):
        response = self.client.get("/api/states")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreaterEqual(len(data), 3)
        states = [s["code"] for s in data]
        self.assertIn("TN", states)
        self.assertIn("MH", states)
        self.assertIn("DL", states)

    def test_get_categories(self):
        response = self.client.get("/api/categories")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("Speed", data)
        self.assertIn("Safety", data)
        self.assertIn("DUI", data)

    def test_get_rules_unfiltered(self):
        response = self.client.get("/api/rules")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data), 0)
        # Check rule keys
        first_rule = data[0]
        self.assertIn("violation_id", first_rule)
        self.assertIn("code", first_rule)
        self.assertIn("section", first_rule)
        self.assertIn("title", first_rule)

    def test_download_state_pack(self):
        response = self.client.get("/api/rules/TN/download")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["state_code"], "TN")
        self.assertEqual(data["state_name"], "Tamil Nadu")
        self.assertGreater(len(data["rules"]), 0)
        
        # Verify specific Tamil Nadu helmet rule details
        helmet_rule = next(r for r in data["rules"] if r["violation_id"] == "no-helmet")
        self.assertEqual(helmet_rule["compounding_fee"], 500)
        self.assertTrue(helmet_rule["is_compoundable"])

    def test_sync_offline_logs(self):
        payload = {
            "device_id": "test_device_123",
            "logs": [
                {
                    "device_id": "test_device_123",
                    "violation_id": "no-helmet",
                    "state_code": "TN",
                    "vehicle_type": "2-Wheeler",
                    "fine_amount": 500,
                    "timestamp": 1716945600
                }
            ]
        }
        response = self.client.post("/api/sync", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "success")
        self.assertEqual(data["synced_count"], 1)

        # Check DB that log was inserted
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM sync_queue WHERE device_id = 'test_device_123';")
        rows = cursor.fetchall()
        conn.close()
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["violation_id"], "no-helmet")

    def test_profile_endpoints(self):
        # 1. Get profile (should auto-create default)
        response = self.client.get("/api/profile/test_device_123")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["device_id"], "test_device_123")
        self.assertEqual(data["name"], "Mock Driver")
        
        # 2. Update profile
        payload = {
            "name": "Super Driver",
            "email": "super@driver.com",
            "phone": "9876543210",
            "safety_score": 90,
            "country": "IN",
            "state_code": "TN",
            "city": "Chennai",
            "vehicles": [
                {
                    "id": "v99",
                    "name": "Fast Car",
                    "type": "car",
                    "registration_state": "TN",
                    "registration_number": "TN01AA1111"
                }
            ]
        }
        response = self.client.post("/api/profile/test_device_123", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")
        
        # 3. Get profile again to verify updates
        response = self.client.get("/api/profile/test_device_123")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], "Super Driver")
        self.assertEqual(data["email"], "super@driver.com")
        self.assertEqual(len(data["vehicles"]), 1)
        self.assertEqual(data["vehicles"][0]["name"], "Fast Car")

    def test_get_challans(self):
        # Check challan for TN01AB1234
        response = self.client.get("/api/user/challans?plate=TN01AB1234")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("challans", data)
        self.assertEqual(len(data["challans"]), 2)
        self.assertEqual(data["challans"][0]["vehicleNumber"], "TN01AB1234")
        
        # Check case and formatting insensitivity (e.g. tn-01 ab 1234)
        response = self.client.get("/api/user/challans?plate=tn-01%20ab%201234")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data["challans"]), 2)

    def test_notifications_endpoints(self):
        # 1. Get notifications list
        response = self.client.get("/api/notifications")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertGreater(len(data), 0)
        notif_id = data[0]["id"]
        
        # 2. Mark one as read
        response = self.client.post(f"/api/notifications/{notif_id}/read")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "success")
        
        # Verify read status
        response = self.client.get("/api/notifications")
        self.assertEqual(response.status_code, 200)
        updated_data = response.json()
        target_notif = next(n for n in updated_data if n["id"] == notif_id)
        self.assertTrue(target_notif["read"])

        # 3. Mark all read
        response = self.client.post("/api/notifications/mark-all-read")
        self.assertEqual(response.status_code, 200)
        
        # Verify all are read
        response = self.client.get("/api/notifications")
        for n in response.json():
            self.assertTrue(n["read"])

        # 4. Clear all
        response = self.client.post("/api/notifications/clear-all")
        self.assertEqual(response.status_code, 200)
        
        # Verify cleared
        response = self.client.get("/api/notifications")
        self.assertEqual(len(response.json()), 0)

if __name__ == "__main__":
    unittest.main()
