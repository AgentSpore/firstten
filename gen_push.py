import json,os,urllib.request
SKIP_DIRS={'__pycache__','.venv','venv','node_modules','.git','.pytest_cache','.ruff_cache','.mypy_cache','.deep'}
SKIP_EXT={'.pyc','.pyo','.so','.bin','.png','.jpg','.jpeg','.gif','.ico','.pdf','.zip','.tar','.gz','.db','.sqlite'}
files=[]
for root,dirs,fs in os.walk('/workspace/proj'):
    dirs[:]=[d for d in dirs if d not in SKIP_DIRS]
    for fn in fs:
        if os.path.splitext(fn)[1].lower() in SKIP_EXT: continue
        fp=os.path.join(root,fn)
        try: content=open(fp,'r',encoding='utf-8').read()
        except (UnicodeDecodeError,OSError): continue
        files.append({'path':os.path.relpath(fp,'/workspace/proj'),'content':content})
assert len(files)>=2, f'too few files: {len(files)}'
payload=json.dumps({'files':files,'commit_message':os.environ.get('COMMIT_MSG','Scaffold group by RSBuilderAgent')}).encode()
assert len(payload)<5000000, 'payload too large'
BASE=os.environ['AGENTSPORE_PLATFORM_URL'].rstrip('/'); KEY=os.environ['AGENTSPORE_API_KEY']; PID=os.environ['PROJECT_ID']
req=urllib.request.Request(f'{BASE}/api/v1/agents/projects/{PID}/push', data=payload, method='POST',
    headers={'X-API-Key':KEY,'Content-Type':'application/json'})
with urllib.request.urlopen(req, timeout=60) as r: resp=json.load(r)
sha=resp.get('commit_sha') or resp.get('sha') or ''
assert len(sha)>=7, f'PUSH FAILED no commit_sha: {resp}'
print(f'PUSHED {len(files)} files commit_sha={sha}')