from typing import Any, Dict, List
import datetime
import uuid

# UUIDs for the 6 application-level participants
# We use deterministic UUIDs so they remain consistent across restarts
ORG_GREEN_VALLEY_ID = "11111111-1111-4111-a111-111111111111"  # Producer
ORG_FRESH_HARVEST_ID = "22222222-2222-4222-a222-222222222222" # Processor
ORG_FAST_LOGISTICS_ID = "33333333-3333-4333-a333-333333333333" # Transporter
ORG_FRESH_MART_ID = "44444444-4444-4444-a444-444444444444"    # Retailer
ORG_FSA_ID = "55555555-5555-4555-a555-555555555555"          # Regulator
USR_CONSUMER_ID = "66666666-6666-4666-a666-666666666666"      # Consumer

class SharedDemoState:
    """
    Canonical demo state for MOCK_MODE=true.
    This provides a unified simulation dataset for both DataServiceMock and BlockchainServiceMock.
    """
    def __init__(self):
        now = datetime.datetime.now(datetime.timezone.utc).isoformat()

        # --- ORGANIZATIONS ---
        self.organizations: Dict[str, Dict[str, Any]] = {
            ORG_GREEN_VALLEY_ID: {
                "org_id": ORG_GREEN_VALLEY_ID,
                "name": "Green Valley Citrus Farms",
                "type": "PRODUCER",
                "fabric_msp_id": "Org1MSP",
                "created_at": now
            },
            ORG_FRESH_HARVEST_ID: {
                "org_id": ORG_FRESH_HARVEST_ID,
                "name": "FreshHarvest Processing",
                "type": "PROCESSOR",
                "fabric_msp_id": "Org1MSP",
                "created_at": now
            },
            ORG_FAST_LOGISTICS_ID: {
                "org_id": ORG_FAST_LOGISTICS_ID,
                "name": "FastLogistics",
                "type": "TRANSPORTER",
                "fabric_msp_id": "Org2MSP",
                "created_at": now
            },
            ORG_FRESH_MART_ID: {
                "org_id": ORG_FRESH_MART_ID,
                "name": "FreshMart",
                "type": "RETAILER",
                "fabric_msp_id": "Org2MSP",
                "created_at": now
            },
            ORG_FSA_ID: {
                "org_id": ORG_FSA_ID,
                "name": "Food Safety Authority",
                "type": "REGULATOR",
                "fabric_msp_id": "SystemMSP",
                "created_at": now
            }
        }

        # --- USERS ---
        self.users: Dict[str, Dict[str, Any]] = {
            USR_CONSUMER_ID: {
                "user_id": USR_CONSUMER_ID,
                "auth_subject": "demo_consumer",
                "organization_id": None,
                "role_id": "role_consumer",
                "created_at": now
            }
        }

        # --- PRODUCTS ---
        self.products: Dict[str, Dict[str, Any]] = {
            "prd-orange-001": {
                "product_id": "prd-orange-001",
                "name": "Organic Valencia Orange",
                "sku": "SKU-ORG-VAL-01",
                "category": "PRODUCE",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "created_at": now
            },
            "prd-mango-001": {
                "product_id": "prd-mango-001",
                "name": "Alphonso Mango",
                "sku": "SKU-MNG-ALPH-01",
                "category": "PRODUCE",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "created_at": now
            },
            "prd-apple-001": {
                "product_id": "prd-apple-001",
                "name": "Fuji Apple",
                "sku": "SKU-APL-FUJI-01",
                "category": "PRODUCE",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "created_at": now,
                "metadata": {
                    "brand": "FreshHarvest",
                    "origin": "Green Valley Farms, Plot 4",
                    "certifications": [{"name": "USDA Organic", "status": "VALID", "evidence_cid": "QmCert1"}],
                    "allergens": "No declared allergens",
                    "ingredients": ["Fresh Apples", "Permitted Processing Ingredients"],
                    "source_of_raw_materials": [
                        {"material": "Fresh Apples", "parent_batch_id": "batch-apple-001-raw", "supplier": "Green Valley Farms", "origin_location": "Pune, Maharashtra, India"}
                    ],
                    "storage_instructions": "Store in a cool, dry place.",
                    "label_information": {"net_quantity": "1 L", "storage": "Keep refrigerated"},
                    "quality_and_testing": {
                        "tests": [
                            {"test_item": "Pesticide Residue", "unit": "mg/kg", "method": "Laboratory Analysis", "result": "PASS", "evidence_cid": "QmLabReport001"}
                        ]
                    }
                }
            }
        }

        # --- BATCHES (Canonical Traceability Journey) ---
        # The Journey: Producer -> Processor -> Transporter -> Retailer
        # Extended with a wide tree: 2 raw batches -> 1 packaged -> 2 distribution batches -> 3 store batches
        
        self.batches: Dict[str, Dict[str, Any]] = {
            # 1. Raw Harvest Batch A (Green Valley)
            "batch-apple-001-raw": {
                "batch_id": "batch-apple-001-raw",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_GREEN_VALLEY_ID,
                "lifecycle_state": "REGISTERED",
                "quantity": 5000.0,
                "unit_of_measure": "KG",
                "created_at": now,
                "metadata": {"harvest_date": "2026-08-10", "field_id": "F-04", "organic_certified": True}
            },
            # 2. Raw Harvest Batch B - second field (Green Valley)
            "batch-apple-002-raw": {
                "batch_id": "batch-apple-002-raw",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_GREEN_VALLEY_ID,
                "lifecycle_state": "REGISTERED",
                "quantity": 3800.0,
                "unit_of_measure": "KG",
                "created_at": now,
                "metadata": {"harvest_date": "2026-08-11", "field_id": "F-07", "organic_certified": True}
            },
            # 3. Processed/Packaged Batch (FreshHarvest merged both raw batches)
            "batch-apple-001-packaged": {
                "batch_id": "batch-apple-001-packaged",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FRESH_MART_ID,
                "lifecycle_state": "RECEIVED",
                "quantity": 1000.0,
                "unit_of_measure": "BOXES",
                "unit": "L",
                "metadata": {
                    "packaging_type": "Eco-friendly Box",
                    "batch_inspector": "John Doe",
                    "production_date": now,
                    "current_custodian_name": "FreshMart",
                    "current_custodian_role": "RETAILER",
                    "evidence": [
                        {"type": "LAB_TEST_REPORT", "cid": "QmLabReport001", "available": True},
                        {"type": "PROCESSING_REPORT", "cid": "QmProcessing001", "available": True}
                    ]
                },
                "created_at": now
            },
            # 4. Distribution Batch - North Zone (FastLogistics)
            "batch-apple-dist-north": {
                "batch_id": "batch-apple-dist-north",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FAST_LOGISTICS_ID,
                "lifecycle_state": "IN_TRANSIT",
                "quantity": 500.0,
                "unit_of_measure": "BOXES",
                "metadata": {"route": "Thane → Nashik → Pune", "vehicle_no": "MH-04-AB-1234"},
                "created_at": now
            },
            # 5. Distribution Batch - South Zone (FastLogistics)
            "batch-apple-dist-south": {
                "batch_id": "batch-apple-dist-south",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FAST_LOGISTICS_ID,
                "lifecycle_state": "IN_TRANSIT",
                "quantity": 500.0,
                "unit_of_measure": "BOXES",
                "metadata": {"route": "Thane → Navi Mumbai → Colaba", "vehicle_no": "MH-04-CD-5678"},
                "created_at": now
            },
            # 6. Store Batch - FreshMart Colaba
            "batch-apple-retail-colaba": {
                "batch_id": "batch-apple-retail-colaba",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FRESH_MART_ID,
                "lifecycle_state": "RECEIVED",
                "quantity": 200.0,
                "unit_of_measure": "BOXES",
                "metadata": {"store": "FreshMart Colaba", "shelf_life_days": 14},
                "created_at": now
            },
            # 7. Store Batch - FreshMart Andheri
            "batch-apple-retail-andheri": {
                "batch_id": "batch-apple-retail-andheri",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FRESH_MART_ID,
                "lifecycle_state": "RECEIVED",
                "quantity": 150.0,
                "unit_of_measure": "BOXES",
                "metadata": {"store": "FreshMart Andheri", "shelf_life_days": 14},
                "created_at": now
            },
            # 8. Store Batch - FreshMart Pune
            "batch-apple-retail-pune": {
                "batch_id": "batch-apple-retail-pune",
                "product_id": "prd-apple-001",
                "producer_org_id": ORG_GREEN_VALLEY_ID,
                "current_custodian_org_id": ORG_FRESH_MART_ID,
                "lifecycle_state": "RECEIVED",
                "quantity": 150.0,
                "unit_of_measure": "BOXES",
                "metadata": {"store": "FreshMart Pune", "shelf_life_days": 14},
                "created_at": now
            }
        }

        # --- LINEAGE (Parents / Children) ---
        # Full tree:
        #   batch-apple-001-raw  ─┐
        #                          ├─> batch-apple-001-packaged ─> batch-apple-dist-north ─> batch-apple-retail-andheri
        #   batch-apple-002-raw  ─┘                             ─> batch-apple-dist-north ─> batch-apple-retail-pune
        #                                                        ─> batch-apple-dist-south ─> batch-apple-retail-colaba
        self.lineage_edges: List[Dict[str, Any]] = [
            # Two raw batches → one packaged batch
            {
                "edge_id": "edge-apple-proc-1",
                "parent_batch_id": "batch-apple-001-raw",
                "child_batch_id": "batch-apple-001-packaged",
                "metadata": {"operation": "Washing and Packaging - Field F-04 Contribution"},
                "created_at": now
            },
            {
                "edge_id": "edge-apple-proc-2",
                "parent_batch_id": "batch-apple-002-raw",
                "child_batch_id": "batch-apple-001-packaged",
                "metadata": {"operation": "Washing and Packaging - Field F-07 Contribution"},
                "created_at": now
            },
            # Packaged → two distribution batches
            {
                "edge_id": "edge-apple-dist-north",
                "parent_batch_id": "batch-apple-001-packaged",
                "child_batch_id": "batch-apple-dist-north",
                "metadata": {"operation": "Split for North Zone Distribution"},
                "created_at": now
            },
            {
                "edge_id": "edge-apple-dist-south",
                "parent_batch_id": "batch-apple-001-packaged",
                "child_batch_id": "batch-apple-dist-south",
                "metadata": {"operation": "Split for South Zone Distribution"},
                "created_at": now
            },
            # North dist → Andheri + Pune stores
            {
                "edge_id": "edge-apple-retail-andheri",
                "parent_batch_id": "batch-apple-dist-north",
                "child_batch_id": "batch-apple-retail-andheri",
                "metadata": {"operation": "Store Delivery - Andheri Branch"},
                "created_at": now
            },
            {
                "edge_id": "edge-apple-retail-pune",
                "parent_batch_id": "batch-apple-dist-north",
                "child_batch_id": "batch-apple-retail-pune",
                "metadata": {"operation": "Store Delivery - Pune Branch"},
                "created_at": now
            },
            # South dist → Colaba store
            {
                "edge_id": "edge-apple-retail-colaba",
                "parent_batch_id": "batch-apple-dist-south",
                "child_batch_id": "batch-apple-retail-colaba",
                "metadata": {"operation": "Store Delivery - Colaba Branch"},
                "created_at": now
            },
        ]

        # --- UNITS & QR ---
        # QR Resolution: QR-APPLE-001 resolves to batch-apple-001-packaged
        self.units: Dict[str, Dict[str, Any]] = {
            "unit-apple-1": {
                "unit_id": "unit-apple-1",
                "batch_id": "batch-apple-001-packaged",
                "qr_identifier": "QR-APPLE-001",
                "created_at": now
            },
            "unit-orange-1": {
                "unit_id": "unit-orange-1",
                "batch_id": "batch-orange-001", # Unused in full flow but queryable
                "qr_identifier": "QR-ORANGE-001",
                "created_at": now
            }
        }
        
        self.qr_to_entity: Dict[str, Dict[str, str]] = {
            "QR-APPLE-001": {"type": "BATCH", "id": "batch-apple-001-packaged"},
            "QR-ORANGE-001": {"type": "BATCH", "id": "batch-orange-001"}
        }

        # --- EVENTS & AUDIT TRAIL ---
        # NOTE: fabric_tx_id, block_number, actor_msp, channel_id, and location
        # are MOCK_MODE demo values only. In MOCK_MODE=false they originate from the real Fabric ledger.
        self.events: List[Dict[str, Any]] = [
            {
                "event_id": "evt-1",
                "type": "BATCH_REGISTERED",
                "target_id": "batch-apple-001-raw",
                "actor_org_id": ORG_GREEN_VALLEY_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0001",
                "block_number": 1,
                "actor_msp": "Org1MSP",
                "channel_id": "traceability-channel",
                "state_before": None,
                "state_after": "REGISTERED",
                "latitude": 19.8762,
                "longitude": 75.3433,
                "location_name": "Aurangabad, Maharashtra (Harvest Farm)",
                "timestamp": now,
                "metadata": {
                    "action": "Producer registered raw apple batch",
                    "actor_organization_name": "Green Valley Farms",
                    "actor_role": "PRODUCER",
                    "product": {"product_name": "Raw Honeycrisp Apples", "batch_id": "batch-apple-001-raw"},
                    "conditions": {"temperature": "20C", "humidity": "60%", "crop_condition": "GOOD"},
                    "custody": {
                        "previous_custodian": None,
                        "current_custodian": ORG_GREEN_VALLEY_ID,
                        "expected_custodian": ORG_FRESH_HARVEST_ID,
                        "destination": "FreshHarvest Processing Facility"
                    },
                    "evidence": [
                        {"type": "FARM_REGISTRATION", "cid": "QmFarmEvidence001", "available": True}
                    ]
                }
            },
            {
                "event_id": "evt-2",
                "type": "BATCH_PROCESSED",
                "target_id": "batch-apple-001-packaged",
                "actor_org_id": ORG_FRESH_HARVEST_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0002",
                "block_number": 3,
                "actor_msp": "Org1MSP",
                "channel_id": "traceability-channel",
                "state_before": "RECEIVED",
                "state_after": "PROCESSED",
                "latitude": 19.0760,
                "longitude": 72.8777,
                "location_name": "Mumbai, Maharashtra (Processing Facility)",
                "timestamp": now,
                "metadata": {
                    "action": "Manufacturer transformed apples into Apple Juice",
                    "actor_organization_name": "FreshHarvest Processing",
                    "actor_role": "PROCESSOR",
                    "transformation": {
                        "input_batches": ["batch-apple-001-raw"],
                        "output_batch": "batch-apple-001-packaged",
                        "input_product": "Raw Honeycrisp Apples",
                        "output_product": "Fresh Apple Juice",
                        "input_quantity": 5000,
                        "input_unit": "KG",
                        "output_quantity": 2400,
                        "output_unit": "L"
                    },
                    "conditions": {
                        "processing_status": "COMPLETED",
                        "quality_status": "PASSED"
                    },
                    "custody": {
                        "previous_custodian": ORG_GREEN_VALLEY_ID,
                        "current_custodian": ORG_FRESH_HARVEST_ID,
                        "expected_custodian": ORG_FAST_LOGISTICS_ID
                    },
                    "evidence": [
                        {"type": "PROCESSING_REPORT", "cid": "QmProcessing001", "available": True}
                    ]
                }
            },
            {
                "event_id": "evt-3",
                "type": "BATCH_TRANSFERRED",
                "target_id": "batch-apple-001-packaged",
                "actor_org_id": ORG_FAST_LOGISTICS_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0003",
                "block_number": 5,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "PROCESSED",
                "state_after": "IN_TRANSIT",
                "latitude": 19.2183,
                "longitude": 72.9781,
                "location_name": "Lokmanya Nagar, Thane, Maharashtra",
                "timestamp": now,
                "metadata": {
                    "action": "Transporter received from Processor",
                    "actor_organization_name": "FastLogistics",
                    "actor_role": "TRANSPORTER",
                    "vehicle_no": "MH-04-AB-1234",
                    "conditions": {"temperature_maintained": "4C", "storage": "REFRIGERATED"},
                    "custody": {
                        "previous_custodian": ORG_FRESH_HARVEST_ID,
                        "current_custodian": ORG_FAST_LOGISTICS_ID,
                        "expected_custodian": ORG_FRESH_MART_ID
                    }
                }
            },
            {
                "event_id": "evt-4",
                "type": "BATCH_RECEIVED",
                "target_id": "batch-apple-001-packaged",
                "actor_org_id": ORG_FRESH_MART_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0004",
                "block_number": 7,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "IN_TRANSIT",
                "state_after": "RECEIVED",
                "latitude": 18.9220,
                "longitude": 72.8347,
                "location_name": "Colaba, Mumbai (FreshMart Store)",
                "timestamp": now,
                "metadata": {
                    "action": "Retailer received shipment",
                    "actor_organization_name": "FreshMart",
                    "actor_role": "RETAILER",
                    "conditions": {"storage": "REFRIGERATED", "temperature_c": 4.5, "quality_status": "ACCEPTED"},
                    "custody": {
                        "previous_custodian": ORG_FAST_LOGISTICS_ID,
                        "current_custodian": ORG_FRESH_MART_ID,
                        "expected_custodian": None
                    }
                }
            },
            # Events for the second raw batch (Field F-07)
            {
                "event_id": "evt-5",
                "type": "BATCH_REGISTERED",
                "target_id": "batch-apple-002-raw",
                "actor_org_id": ORG_GREEN_VALLEY_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0005",
                "block_number": 2,
                "actor_msp": "Org1MSP",
                "channel_id": "traceability-channel",
                "state_before": None,
                "state_after": "REGISTERED",
                "latitude": 19.8850,
                "longitude": 75.3590,
                "location_name": "Aurangabad, Maharashtra (Field F-07)",
                "timestamp": now,
                "metadata": {
                    "action": "Producer registered second raw batch from field F-07",
                    "actor_organization_name": "Green Valley Citrus Farms",
                    "actor_role": "PRODUCER",
                    "conditions": {"temperature": "22C", "humidity": "58%", "crop_condition": "EXCELLENT"},
                }
            },
            # Events for North Zone Distribution
            {
                "event_id": "evt-6",
                "type": "BATCH_TRANSFERRED",
                "target_id": "batch-apple-dist-north",
                "actor_org_id": ORG_FAST_LOGISTICS_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0006",
                "block_number": 9,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "RECEIVED",
                "state_after": "IN_TRANSIT",
                "latitude": 19.2183,
                "longitude": 72.9781,
                "location_name": "Thane Distribution Hub (FastLogistics)",
                "timestamp": now,
                "metadata": {
                    "action": "North Zone distribution vehicle dispatched",
                    "actor_organization_name": "FastLogistics",
                    "actor_role": "TRANSPORTER",
                    "vehicle_no": "MH-04-AB-1234",
                    "conditions": {"temperature_maintained": "4C", "storage": "REFRIGERATED"}
                }
            },
            # Events for South Zone Distribution
            {
                "event_id": "evt-7",
                "type": "BATCH_TRANSFERRED",
                "target_id": "batch-apple-dist-south",
                "actor_org_id": ORG_FAST_LOGISTICS_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0007",
                "block_number": 10,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "RECEIVED",
                "state_after": "IN_TRANSIT",
                "latitude": 19.0330,
                "longitude": 73.0297,
                "location_name": "Navi Mumbai Logistics Hub (FastLogistics)",
                "timestamp": now,
                "metadata": {
                    "action": "South Zone distribution vehicle dispatched",
                    "actor_organization_name": "FastLogistics",
                    "actor_role": "TRANSPORTER",
                    "vehicle_no": "MH-04-CD-5678",
                    "conditions": {"temperature_maintained": "4C", "storage": "REFRIGERATED"}
                }
            },
            # Store receipt events
            {
                "event_id": "evt-8",
                "type": "BATCH_RECEIVED",
                "target_id": "batch-apple-retail-andheri",
                "actor_org_id": ORG_FRESH_MART_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0008",
                "block_number": 12,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "IN_TRANSIT",
                "state_after": "RECEIVED",
                "latitude": 19.1136,
                "longitude": 72.8697,
                "location_name": "Andheri West, Mumbai (FreshMart Andheri)",
                "timestamp": now,
                "metadata": {
                    "action": "FreshMart Andheri received stock",
                    "actor_organization_name": "FreshMart",
                    "actor_role": "RETAILER",
                    "conditions": {"storage": "REFRIGERATED", "temperature_c": 4.2, "quality_status": "ACCEPTED"}
                }
            },
            {
                "event_id": "evt-9",
                "type": "BATCH_RECEIVED",
                "target_id": "batch-apple-retail-pune",
                "actor_org_id": ORG_FRESH_MART_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0009",
                "block_number": 13,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "IN_TRANSIT",
                "state_after": "RECEIVED",
                "latitude": 18.5204,
                "longitude": 73.8567,
                "location_name": "Koregaon Park, Pune (FreshMart Pune)",
                "timestamp": now,
                "metadata": {
                    "action": "FreshMart Pune received stock",
                    "actor_organization_name": "FreshMart",
                    "actor_role": "RETAILER",
                    "conditions": {"storage": "REFRIGERATED", "temperature_c": 4.8, "quality_status": "ACCEPTED"}
                }
            },
            {
                "event_id": "evt-10",
                "type": "BATCH_RECEIVED",
                "target_id": "batch-apple-retail-colaba",
                "actor_org_id": ORG_FRESH_MART_ID,
                "actor_user_id": "00000000-0000-0000-0000-000000000000",
                "fabric_tx_id": "tx-demo-fabric-0010",
                "block_number": 14,
                "actor_msp": "Org2MSP",
                "channel_id": "traceability-channel",
                "state_before": "IN_TRANSIT",
                "state_after": "RECEIVED",
                "latitude": 18.9220,
                "longitude": 72.8347,
                "location_name": "Colaba, Mumbai (FreshMart Store)",
                "timestamp": now,
                "metadata": {
                    "action": "FreshMart Colaba received stock",
                    "actor_organization_name": "FreshMart",
                    "actor_role": "RETAILER",
                    "conditions": {"storage": "REFRIGERATED", "temperature_c": 4.5, "quality_status": "ACCEPTED"}
                }
            }
        ]
        
        self.scan_events: List[Dict[str, Any]] = [
            {"scan_id": "scan-1", "reference_id": "batch-apple-001-packaged", "scan_type": "CONSUMER_QR", "timestamp": now}
        ]

        # --- IPFS EVIDENCE ---
        self.ipfs_storage: Dict[str, Dict[str, Any]] = {
            "QmDemoOrangeQualityReport": {
                "cid": "QmDemoOrangeQualityReport",
                "filename": "Orange_Quality_Report.pdf",
                "size_bytes": 1048576,
                "created_at": now
            },
            "QmDemoTransportManifest": {
                "cid": "QmDemoTransportManifest",
                "filename": "Transport_Manifest.pdf",
                "size_bytes": 512000,
                "created_at": now
            }
        }

        # --- INCIDENTS & RECALLS ---
        self.incidents: Dict[str, Dict[str, Any]] = {
            "inc-demo-1": {
                "incident_id": "inc-demo-1",
                "batch_id": "batch-apple-001-packaged",
                "unitId": "batch-apple-001-packaged",
                "category": "Pesticide Contamination",
                "reporter": "Consumer (Mobile App)",
                "status": "OPEN",
                "description": "Lab test alert: Elevated chemical residue detected in packaged apple units.",
                "ipfsCid": "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
                "date": "14 Aug 2026",
                "created_at": now
            },
            "inc-demo-2": {
                "incident_id": "inc-demo-2",
                "batch_id": "batch-apple-retail-colaba",
                "unitId": "batch-apple-retail-colaba",
                "category": "Spoilage & Odor",
                "reporter": "Store Manager (Colaba Branch)",
                "status": "OPEN",
                "description": "Premature fermentation reported in stored boxes at retail outlet.",
                "ipfsCid": "QmCert1Z4eYmKgE5z34XpWw9G7DkF5d5n9y6jZ8t",
                "date": "15 Aug 2026",
                "created_at": now
            },
            "inc-demo-3": {
                "incident_id": "inc-demo-3",
                "batch_id": "batch-apple-dist-north",
                "unitId": "batch-apple-dist-north",
                "category": "Cold-Chain Breach",
                "reporter": "IoT Temperature Sensor #TH-04",
                "status": "NEW",
                "description": "Temperature excursion above 12°C recorded for 4 continuous hours in transit.",
                "ipfsCid": "QmLabReport001Z4eYmKgE5z34XpWw9G7DkF5d5n9y6",
                "date": "16 Aug 2026",
                "created_at": now
            }
        }
        
        self.recalls: Dict[str, Dict[str, Any]] = {}
        
        # --- BLOCKCHAIN COMMITTED TRANSACTIONS ---
        self.committed_transactions: List[Dict[str, Any]] = [
            {
                "tx_id": f"tx-demo-1",
                "block_number": 1,
                "contract": "TraceabilityContract",
                "function": "registerBatch",
                "args": {"batch_id": "batch-apple-001-raw"},
                "status": "COMMITTED",
                "timestamp": now
            }
        ]

        # --- BLOCKCHAIN NETWORK CONFIG (MOCK MODE only) ---
        self.blockchain_config: Dict[str, str] = {
            "channel_id": "traceability-channel",
            "chaincode_name": "traceability",
            "network": "sih-fabric-network"
        }

# Global Singleton for Mock Mode
demo_state = SharedDemoState()
