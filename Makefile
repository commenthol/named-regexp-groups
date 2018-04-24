all: install test

test: 4. 6. 8. 9.

install:
	npm install

prepublish:
	npm run all

%:
	n $@
	npm test
	#npm run coverage

.PHONY: all prepublish test install
