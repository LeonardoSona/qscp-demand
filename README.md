# QSCP Data & AI Playbook V3

This is a configuration-driven, vanilla JavaScript single-page application.

## Run locally

Because the application loads JSON configuration files with `fetch`, it must be served through a local web server.

From the project directory:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Structure

- `data/playbooks.json` — demand types shown on the homepage
- `data/journeys.json` — phases used by each playbook
- `data/steps.json` — phase guidance, RACI, gates and services
- `data/governance.json` — decision-gate drawer content
- `data/services.json` — CDO service and team information
- `data/assets.json` — sample existing Data Products and reusable assets
