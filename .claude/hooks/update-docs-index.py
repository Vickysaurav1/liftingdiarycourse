#!/usr/bin/env python3
import json, sys, os

data = json.load(sys.stdin)
fp = data.get('tool_input', {}).get('file_path', '')

root = '/Users/sauravkumar/liftingdiarycourse'
docs_dir = root + '/docs/'

if not (fp.startswith(docs_dir) and fp.endswith('.md')):
    sys.exit(0)

fname = os.path.basename(fp)
rel = f'/docs/{fname}'
claude_md = root + '/CLAUDE.md'

with open(claude_md) as f:
    content = f.read()

if rel in content:
    sys.exit(0)

desc = 'documentation'
if os.path.exists(fp):
    with open(fp) as f:
        for line in f:
            line = line.strip()
            if line.startswith('#'):
                desc = line.lstrip('#').strip()
                break

entry = f'- `{rel}` \u2014 {desc}'
updated = content.replace('\n\n## Architecture', f'\n{entry}\n\n## Architecture')

with open(claude_md, 'w') as f:
    f.write(updated)
