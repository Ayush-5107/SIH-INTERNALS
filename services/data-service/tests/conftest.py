import asyncio
import pytest
import pytest_asyncio
import httpx
from typing import AsyncGenerator
import sys

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import text

from app.database import Base
from app.config import settings
from app.dependencies import get_db
from app.main import app

# Async engine for testing (points to PostgreSQL integration database)
# PostgreSQL is mandatory; no SQLite fallbacks are permitted.
TEST_DATABASE_URL = settings.DATABASE_URL

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    """
    Creates tables in PostgreSQL before tests and drops them after tests complete.
    """
    # Import all models to ensure they are registered on Base
    from app.models import Base
    
    async with test_engine.begin() as conn:
        # Clean up any old tables first by dropping schema CASCADE to avoid circular dependencies
        await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        await conn.run_sync(Base.metadata.create_all)
    
    await test_engine.dispose()
    yield

@pytest_asyncio.fixture(autouse=True)
async def clean_db():
    yield
    from app.models import Base
    async with test_engine.begin() as conn:
        table_names = [table.name for table in Base.metadata.sorted_tables]
        if table_names:
            tables_str = ", ".join(f'"{name}"' for name in table_names)
            await conn.execute(text(f"TRUNCATE TABLE {tables_str} CASCADE;"))

@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provides a transactional database session for tests."""
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
            await test_engine.dispose()

# Mock Redis Client
class MockRedis:
    def __init__(self):
        self.store = {}
    async def ping(self):
        return True
    async def get(self, key: str):
        return self.store.get(key)
    async def set(self, key: str, value: str, ex=None):
        self.store[key] = value
        return True
    async def delete(self, key: str):
        if key in self.store:
            del self.store[key]
            return True
        return False
    async def is_ready(self) -> bool:
        return True

# Mock IPFS Client
class MockIpfs:
    def __init__(self):
        self.store = {}
    async def is_ready(self) -> bool:
        return True
    async def add_file(self, content: bytes):
        import hashlib
        h = hashlib.sha256(content).hexdigest()
        cid = f"QmTestMock{h[:10]}"
        self.store[cid] = content
        return cid, h
    async def cat_file(self, cid: str):
        if cid in self.store:
            return self.store[cid]
        raise Exception(f"CID {cid} not found in Mock IPFS")

@pytest.fixture(autouse=True)
def mock_redis_and_ipfs(monkeypatch):
    """
    Mocks redis and ipfs global clients with mock storage to isolate integration tests.
    """
    from app.redis.client import redis_cache
    from app.ipfs.client import ipfs_client
    
    mock_redis = MockRedis()
    mock_ipfs = MockIpfs()
    
    monkeypatch.setattr(redis_cache, "redis", mock_redis)
    monkeypatch.setattr(redis_cache, "get", mock_redis.get)
    monkeypatch.setattr(redis_cache, "set", mock_redis.set)
    monkeypatch.setattr(redis_cache, "delete", mock_redis.delete)
    monkeypatch.setattr(redis_cache, "is_ready", mock_redis.is_ready)
    
    # Mock get_json/set_json helpers as well to use the mock get/set
    async def mock_get_json(key: str):
        import json
        val = await mock_redis.get(key)
        return json.loads(val) if val else None
    
    async def mock_set_json(key: str, val, expire=3600):
        import json
        return await mock_redis.set(key, json.dumps(val))

    monkeypatch.setattr(redis_cache, "get_json", mock_get_json)
    monkeypatch.setattr(redis_cache, "set_json", mock_set_json)
    
    monkeypatch.setattr(ipfs_client, "add_file", mock_ipfs.add_file)
    monkeypatch.setattr(ipfs_client, "cat_file", mock_ipfs.cat_file)
    monkeypatch.setattr(ipfs_client, "is_ready", mock_ipfs.is_ready)
    
    return mock_redis, mock_ipfs

@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[httpx.AsyncClient, None]:
    """
    Returns an HTTP test client connected to the application,
    with database session dependency overridden.
    """
    # Override get_db dependency to use transactional test session
    app.dependency_overrides[get_db] = lambda: db_session
    
    async with httpx.AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
        
    app.dependency_overrides.clear()
