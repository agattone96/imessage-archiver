# Contributing

Thanks for improving Archiver.

## Quick start

```bash
git clone <repo-url>
cd IMSGArchiver
cp .env.example .env
npm install
cd frontend && npm install && cd ..
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

Run in two terminals:

```bash
# Terminal A
npm run dev

# Terminal B
npm run start
```

## Scope

- Docs, bug fixes, and tests are welcome.
- Keep PRs focused and small.
- Do not include secrets or local runtime artifacts.

## Pull request checklist

- [ ] I read `README.md` and this file.
- [ ] I kept changes scoped.
- [ ] I updated docs when behavior changed.
- [ ] I ran relevant checks locally.
- [ ] I removed local artifacts before commit.

## Commit style

Use short imperative messages:

- `docs: add security policy`
- `chore: add issue templates`

## Reporting issues

Use GitHub issue templates and include repro steps, expected behavior, and actual behavior.

## Code of conduct

By participating, you agree to follow `CODE_OF_CONDUCT.md`.
