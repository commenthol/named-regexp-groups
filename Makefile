all: install test

test: 14 16 17

install:
	npm install

prepublish:
	npm run all

%:
	n $@
	pnpm test
	#npm run coverage

.PHONY: all prepublish test install
