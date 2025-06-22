dev:          ## start edge, extension, Laravel
	./scripts/dev.sh

lint:         ## run ESLint + PHP Pint
	npm run lint
	cd api && ./vendor/bin/pint

build: build-edge build-ext

build-edge:
	npm --workspace @lo/edge-api run build

build-ext:
	npm --workspace @lo/extension run build

seed:
	pnpm ts-node scripts/seed-db.ts
