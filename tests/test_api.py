def test_health(client):
    response = client.get('/api/health')
    assert response.status_code == 200

def test_create_resource(client):
    response = client.post('/api/items/', json={'name': 'test item'})
    assert response.status_code == 200 or response.status_code == 201

def test_list_resources(client):
    response = client.get('/api/items/')
    assert response.status_code == 200

def test_invalid_input(client):
    response = client.post('/api/items/', json={})
    assert response.status_code >= 400 and response.status_code < 500

def test_analytics(client):
    response = client.get('/api/analytics')
    assert response.status_code == 200
