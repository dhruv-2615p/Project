"""
BLACK BOX (FUNCTIONAL) TESTS - AI Service API
Tests HTTP endpoints as a consumer would, using FastAPI TestClient.
Mocks RAGEngine to avoid needing real Gemini API key.
"""
import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Mock heavy dependencies that aren't needed for endpoint testing
for mod_name in [
    "langchain_google_genai", "langchain_community", "langchain_community.vectorstores",
    "langchain_text_splitters", "langchain_core", "langchain_core.documents",
    "chromadb", "dotenv", "pysqlite3",
]:
    if mod_name not in sys.modules:
        sys.modules[mod_name] = MagicMock()

# Mock RAGEngine before main.py is imported (it instantiates RAGEngine at module level)
_mock_engine_instance = MagicMock()
_mock_engine_instance.get_response.return_value = {
    "response": "You can reset your password from Settings > Security.",
    "confidence_score": 0.92,
    "sources": ["faq.md"],
    "success": True,
}
_mock_engine_instance.categorize_ticket.return_value = {
    "category": "Technical Support",
    "priority": "High",
    "confidence": 0.88,
}
_mock_engine_instance.reload_knowledge_base.return_value = {"kb_size": 42}

with patch("rag_engine.RAGEngine", return_value=_mock_engine_instance):
    from main import app

import main
main.rag_engine = _mock_engine_instance

from fastapi.testclient import TestClient


@pytest.fixture(autouse=True)
def reset_mock_engine():
    """Reset mock engine calls between tests."""
    _mock_engine_instance.reset_mock()
    _mock_engine_instance.get_response.return_value = {
        "response": "You can reset your password from Settings > Security.",
        "confidence_score": 0.92,
        "sources": ["faq.md"],
        "success": True,
    }
    _mock_engine_instance.categorize_ticket.return_value = {
        "category": "Technical Support",
        "priority": "High",
        "confidence": 0.88,
    }
    _mock_engine_instance.reload_knowledge_base.return_value = {"kb_size": 42}
    main.rag_engine = _mock_engine_instance
    yield _mock_engine_instance


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


# ==================== HEALTH ENDPOINT ====================

class TestHealthEndpoint:
    def test_bb_health_01_returns_200(self, client):
        """BB-HEALTH-01: GET /health returns 200 with correct body."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "AI Customer Support Service"
        assert data["version"] == "1.0.0"


# ==================== QUERY ENDPOINT ====================

class TestQueryEndpoint:
    def test_bb_query_01_valid_query(self, client):
        """BB-QUERY-01: POST /api/ai/query with valid query returns AI response."""
        response = client.post("/api/ai/query", json={
            "query": "How do I reset my password?"
        })
        assert response.status_code == 200
        data = response.json()
        assert "response" in data
        assert "confidence_score" in data
        assert "sources" in data
        assert "should_escalate" in data
        assert data["success"] is True

    def test_bb_query_02_with_ticket_id(self, client):
        """BB-QUERY-02: POST /api/ai/query accepts optional ticket_id."""
        response = client.post("/api/ai/query", json={
            "query": "Billing issue",
            "ticket_id": 42
        })
        assert response.status_code == 200
        assert response.json()["success"] is True

    def test_bb_query_03_missing_query_field(self, client):
        """BB-QUERY-03: POST /api/ai/query without query returns 422."""
        response = client.post("/api/ai/query", json={})
        assert response.status_code == 422

    def test_bb_query_04_empty_query_string(self, client):
        """BB-QUERY-04: POST /api/ai/query with empty string is accepted."""
        response = client.post("/api/ai/query", json={"query": ""})
        # FastAPI accepts empty string (it's a valid str), endpoint handles it
        assert response.status_code == 200

    def test_bb_query_05_escalation_flag(self, client, reset_mock_engine):
        """BB-QUERY-05: Low confidence triggers should_escalate=True."""
        reset_mock_engine.get_response.return_value = {
            "response": "I'm not sure about that.",
            "confidence_score": 0.40,
            "sources": [],
            "success": True,
        }
        response = client.post("/api/ai/query", json={"query": "obscure question"})
        data = response.json()
        assert data["should_escalate"] is True

    def test_bb_query_06_high_confidence_no_escalation(self, client):
        """BB-QUERY-06: High confidence does not trigger escalation."""
        response = client.post("/api/ai/query", json={"query": "password reset"})
        data = response.json()
        assert data["should_escalate"] is False

    def test_bb_query_07_error_returns_500(self, client, reset_mock_engine):
        """BB-QUERY-07: Internal error returns 500."""
        reset_mock_engine.get_response.side_effect = Exception("LLM unavailable")
        response = client.post("/api/ai/query", json={"query": "test"})
        assert response.status_code == 500


# ==================== CATEGORIZE ENDPOINT ====================

class TestCategorizeEndpoint:
    def test_bb_cat_01_valid_description(self, client):
        """BB-CAT-01: POST /api/ai/categorize returns category and priority."""
        response = client.post("/api/ai/categorize", json={
            "description": "My app crashes when I click the login button"
        })
        assert response.status_code == 200
        data = response.json()
        assert "category" in data
        assert "priority" in data
        assert "confidence" in data

    def test_bb_cat_02_with_ticket_id(self, client):
        """BB-CAT-02: Accepts optional ticket_id."""
        response = client.post("/api/ai/categorize", json={
            "description": "Billing overcharge",
            "ticket_id": 99
        })
        assert response.status_code == 200

    def test_bb_cat_03_missing_description(self, client):
        """BB-CAT-03: Missing description returns 422."""
        response = client.post("/api/ai/categorize", json={})
        assert response.status_code == 422

    def test_bb_cat_04_error_returns_500(self, client, reset_mock_engine):
        """BB-CAT-04: Internal error returns 500."""
        reset_mock_engine.categorize_ticket.side_effect = Exception("Engine error")
        response = client.post("/api/ai/categorize", json={"description": "test"})
        assert response.status_code == 500


# ==================== RELOAD KB ENDPOINT ====================

class TestReloadKBEndpoint:
    def test_bb_reload_01_success(self, client):
        """BB-RELOAD-01: POST /api/ai/reload-kb returns success with kb_size."""
        response = client.post("/api/ai/reload-kb")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Knowledge base reloaded successfully"
        assert data["kb_size"] == 42


# ==================== INVALID ROUTES ====================

class TestInvalidRoutes:
    def test_bb_route_01_nonexistent_endpoint(self, client):
        """BB-ROUTE-01: GET /api/ai/nonexistent returns 404."""
        response = client.get("/api/ai/nonexistent")
        assert response.status_code in [404, 405]

    def test_bb_route_02_wrong_method_on_query(self, client):
        """BB-ROUTE-02: GET on POST-only endpoint returns 405."""
        response = client.get("/api/ai/query")
        assert response.status_code == 405
